import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import ChatInterface from "@/components/chat/ChatInterface";
import AgeVerificationModal from "@/components/AgeVerificationModal";

export default function ChatPage() {
  return (
    <>
      <SignedIn>
        <AgeVerificationModal />
        <ChatInterface />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
