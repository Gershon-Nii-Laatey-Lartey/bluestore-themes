
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatRooms = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Conversations</h1>
            <p className="text-gray-600 mt-2">
              Manage all your chats with sellers and buyers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <ChatRoomList />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Conversations</h1>
          <p className="text-gray-600 mt-2">
            Manage all your chats with sellers and buyers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <ChatRoomList />
        </div>
      </div>
    </Layout>
  );
};

export default ChatRooms;
