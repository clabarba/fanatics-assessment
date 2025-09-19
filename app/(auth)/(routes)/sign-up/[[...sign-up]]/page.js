import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="bg-galactic-brain bg-no-repeat bg-cover bg-center w-full h-screen flex items-center justify-center">
        <SignUp />
      </div>
    </div>
  );
}
