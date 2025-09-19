import { NextResponse } from 'next/server';
// Import the new, recommended prisma client
import prisma from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs/server";

// GET handler to retrieve all auctions
export async function GET() {
    try {
        const auctions = await prisma.auction.findMany({
            orderBy: {
                createdAt: 'desc', // Order by creation date, newest first
            },
        });

        // Get unique bidder IDs
        const bidderIds = [...new Set(auctions.map(auction => auction.currentHighestBidderId))];

        // Fetch user names for all unique bidder IDs in a single query
        const bidders = await prisma.user.findMany({
            where: {
                id: {
                    in: bidderIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        // Map bidder names to their IDs for easy lookup
        const biddersMap = new Map(bidders.map(bidder => [bidder.id, bidder.name]));

        // Attach the bidder's name to each auction object
        const auctionsWithNames = auctions.map(auction => ({
            ...auction,
            currentHighestBidder: {
                name: biddersMap.get(auction.currentHighestBidderId) || 'Unknown',
            },
        }));

        return NextResponse.json({ auctions: auctionsWithNames }, { status: 200 });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // 1. Get user information from Clerk authentication
        const { userId } = await auth();
        const user = await currentUser();

        // Check if the user is authenticated
        if (!userId) {
            console.log('Unauthorized: No user ID found', userId);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { itemDescription, startingBid, duration } = await request.json();

        console.log('Received auction data:', { itemDescription, startingBid, duration });

        // 2. Validate incoming data
        if (!itemDescription || startingBid <= 0 || duration <= 0) {
            return NextResponse.json({ error: 'Invalid auction data' }, { status: 400 });
        }

        // 3. Find or create the user record using Clerk's userId
        const prismaUser = await prisma.user.upsert({
            where: { userId: userId },
            update: {
                name: user?.firstName || 'Anonymous', // Update user name if it changes
            },
            create: {
                userId: userId,
                name: user?.firstName || 'Anonymous', // Use user's first name from Clerk
            },
        });

        // 4. Calculate the auction end time (expiresAt)
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 1000);

        // Convert the Date object to a string
        const expiresAtString = expiresAt.toISOString();
        const nowString = now.toISOString();

        // 5. Create a new auction record
        const newAuction = await prisma.auction.create({
            data: {
                itemDescription: itemDescription,
                startingBid: startingBid,
                duration: duration,
                expiresAt: expiresAtString,

                // Link to the user who created the auction
                creatorId: prismaUser.id,

                // Set the initial bid and winner to the creator
                currentHighestBid: startingBid,
                currentHighestBidderId: prismaUser.id,
                lastBidTime: nowString,
            },
        });

        console.log('New auction created:', newAuction);

        // Add the bidder's name to the auction object before sending the response
        const newAuctionWithBidderName = {
            ...newAuction,
            currentHighestBidder: {
                name: prismaUser.name,
            },
        };

        // 6. Return a successful response with the new auction data
        return NextResponse.json({
            message: 'Auction created successfully!',
            auction: newAuctionWithBidderName
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating auction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH handler to place a bid on an auction
export async function PATCH(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { auctionId, newBid } = await request.json();

        if (!auctionId || !newBid) {
            return NextResponse.json({ error: 'Invalid bid data' }, { status: 400 });
        }

        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
        });

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        const now = new Date();
        const expiresAt = new Date(auction.expiresAt);

        // Check if auction is expired
        if (now > expiresAt) {
            return NextResponse.json({ error: 'Bid too late' }, { status: 400 });
        }

        // Check if bid is strictly higher than current highest bid
        if (newBid <= auction.currentHighestBid) {
            return NextResponse.json({ error: 'Bid too low' }, { status: 400 });
        }

        const prismaUser = await prisma.user.upsert({
            where: { userId: userId },
            update: {
                name: user?.firstName || 'Anonymous',
            },
            create: {
                userId: userId,
                name: user?.firstName || 'Anonymous',
            },
        });

        // Extended bidding logic: extend auction if less than 10 seconds remaining
        const remainingTime = expiresAt.getTime() - now.getTime();
        const newExpiresAt = remainingTime < 10000 ? new Date(now.getTime() + 10000) : expiresAt;

        // Update the auction without including the user
        const updatedAuction = await prisma.auction.update({
            where: { id: auctionId },
            data: {
                currentHighestBid: newBid,
                currentHighestBidderId: prismaUser.id,
                expiresAt: newExpiresAt.toISOString(),
                lastBidTime: now.toISOString(),
            },
        });

        // Manually attach the bidder's name to the auction object for the response
        const updatedAuctionWithBidderName = {
            ...updatedAuction,
            currentHighestBidder: {
                name: prismaUser.name,
            },
        };

        return NextResponse.json({
            message: 'Bid placed successfully!',
            auction: updatedAuctionWithBidderName,
        }, { status: 200 });
    } catch (error) {
        console.error('Error placing bid:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
