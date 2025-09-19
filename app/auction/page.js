'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Auction() {
    const [open, setOpen] = useState(false);
    const [itemDescription, setItemDescription] = useState('');
    const [startingBid, setStartingBid] = useState('');
    const [duration, setDuration] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [auctions, setAuctions] = useState([]);
    const [bids, setBids] = useState({});

    // This ref will store the timer IDs to clean them up later
    const timersRef = useRef({});

    const isAuctionLive = (auction) => {
        const now = new Date();
        const expiresAt = new Date(auction.expiresAt);
        return expiresAt > now;
    };

    const getRemainingTime = (auction) => {
        const now = new Date();
        const expiresAt = new Date(auction.expiresAt);
        const diff = expiresAt.getTime() - now.getTime();
        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    const updateTimers = () => {
        setAuctions(currentAuctions => {
            return currentAuctions.map(auction => {
                // If the auction is live, update its remaining time
                if (isAuctionLive(auction)) {
                    return { ...auction, remainingTime: getRemainingTime(auction) };
                }
                return auction;
            });
        });
    };

    // Fetches all auction records and sets up the timers
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await fetch('/api/auction', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch auctions');
                }

                const data = await response.json();
                setAuctions(data.auctions);
            } catch (error) {
                console.error('API call failed:', error);
                toast.error(error.message);
            } finally {
                setIsFetching(false);
            }
        };

        fetchAuctions();
        
        // Start a timer to update remaining times every second
        const timerId = setInterval(updateTimers, 1000);
        timersRef.current = timerId;
        
        return () => {
            // Clean up the timer when the component unmounts
            clearInterval(timersRef.current);
        };
    }, []);

    // Handles the creation of a new auction by calling the API
    const handleCreateAuction = async () => {
        const parsedStartingBid = parseFloat(startingBid);
        
        if (itemDescription.trim() === '') {
            toast.error("Please enter an item description.");
            return;
        }
        if (isNaN(parsedStartingBid) || parsedStartingBid <= 0) {
            toast.error("Starting bid must be a valid number greater than zero.");
            return;
        }
        if (duration <= 0) {
            toast.error("Duration must be greater than zero.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemDescription,
                    startingBid: parsedStartingBid,
                    duration,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create auction');
            }

            const responseData = await response.json();
            setAuctions([responseData.auction, ...auctions]);
            
            toast.success("Auction created successfully!");
            setOpen(false);
            setItemDescription('');
            setStartingBid('');
            setDuration(30);

        } catch (error) {
            console.error('API call failed:', error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBid = async (auctionId, currentHighestBid) => {
        const bidAmount = parseFloat(bids[auctionId]);
        const nextBid = parseFloat(currentHighestBid) + 1;

        if (isNaN(bidAmount) || bidAmount < nextBid) {
            toast.error(`Bid must be at least ${formatBid(nextBid)}.`);
            return;
        }

        try {
            const response = await fetch('/api/auction', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auctionId,
                    newBid: bidAmount,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to place bid');
            }

            // Find the auction and update its state with the new data
            setAuctions(currentAuctions => currentAuctions.map(auction => {
                if (auction.id === auctionId) {
                    return {
                        ...auction,
                        currentHighestBid: responseData.auction.currentHighestBid,
                        currentHighestBidder: {
                            name: responseData.auction.currentHighestBidder.name
                        },
                        expiresAt: responseData.auction.expiresAt,
                    };
                }
                return auction;
            }));

            toast.success("Bid placed successfully!");
            // Fix: Use the auctionId to clear the specific input field
            setBids(currentBids => ({ ...currentBids, [auctionId]: '' }));

        } catch (error) {
            console.error('Bid failed:', error);
            toast.error(error.message);
        }
    };

    const formatBid = (bid) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(bid);
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const liveAuctions = auctions.filter(isAuctionLive);
    const expiredAuctions = auctions.filter(auction => !isAuctionLive(auction));

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <h1 className={clsx('text-4xl sm:text-5xl font-bold text-center sm:text-left transition-all duration-[1000ms] ease-out')}>
                    Auctions
                </h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4">
                            Create Auction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Create New Auction</DialogTitle>
                            <DialogDescription>
                                Enter the details for the new auction.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="itemDescription" className="text-right">
                                    Item Description
                                </Label>
                                <Input
                                    id="itemDescription"
                                    type="text"
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="startingBid" className="text-right">
                                    Starting Bid
                                </Label>
                                <Input
                                    id="startingBid"
                                    type="number"
                                    value={startingBid}
                                    onChange={(e) => setStartingBid(e.target.value)}
                                    className="col-span-3"
                                    step="0.01"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="duration" className="text-right">
                                    Duration (seconds)
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" type="button" disabled={isLoading}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={handleCreateAuction}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                
                {isFetching ? (
                    <div className="flex items-center space-x-2 mt-8">
                        <svg className="animate-spin h-5 w-5 text-gray-900" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading auctions...</span>
                    </div>
                ) : auctions.length === 0 ? (
                    <p className="text-lg text-gray-500 mt-8">No auctions found. Create one to get started!</p>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mt-8">Live Auctions</h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {liveAuctions.length > 0 ? liveAuctions.map((auction) => (
                                <Card key={auction.id} className="w-full">
                                    <CardHeader>
                                        <CardTitle>{auction.itemDescription}</CardTitle>
                                        <CardDescription>
                                            Auction ID: {auction.id}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Highest Bid</span>
                                            <span className="text-base font-semibold">{formatBid(auction.currentHighestBid)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Winner</span>
                                            <span className="text-base font-semibold">{auction.currentHighestBidder.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Remaining</span>
                                            <span className="text-base font-semibold">
                                                {auction.remainingTime ? `${auction.remainingTime.hours.toString().padStart(2, '0')}:${auction.remainingTime.minutes.toString().padStart(2, '0')}:${auction.remainingTime.seconds.toString().padStart(2, '0')}` : 'Expired'}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-2">
                                        <div className="flex w-full space-x-2">
                                            <Input
                                                type="number"
                                                placeholder={`Next bid: ${formatBid(parseFloat(auction.currentHighestBid) + 1)}`}
                                                value={bids[auction.id] || ''}
                                                onChange={(e) => setBids(currentBids => ({ ...currentBids, [auction.id]: e.target.value }))}
                                                step="0.01"
                                            />
                                            <Button onClick={() => handleBid(auction.id, auction.currentHighestBid)}>Bid</Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )) : <p className="text-lg text-gray-500 mt-8">No live auctions.</p>}
                        </div>

                        <h2 className="text-2xl font-bold mt-8">Expired Auctions</h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {expiredAuctions.length > 0 ? expiredAuctions.map((auction) => (
                                <Card key={auction.id} className="w-full">
                                    <CardHeader>
                                        <CardTitle>{auction.itemDescription}</CardTitle>
                                        <CardDescription>
                                            Auction ID: {auction.id}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Bid</span>
                                            <span className="text-base font-semibold">{formatBid(auction.currentHighestBid)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Winner</span>
                                            <span className="text-base font-semibold">{auction.currentHighestBidder.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ended At</span>
                                            <span className="text-base font-semibold">{formatDate(auction.expiresAt)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : <p className="text-lg text-gray-500 mt-8">No expired auctions.</p>}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
