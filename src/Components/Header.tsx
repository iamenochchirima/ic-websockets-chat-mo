import { useAuth } from "./Context";

const Header = () => {
  const { logout, ws } = useAuth();

  const handleLogout = async () => {
    logout();
    window.location.reload();
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        className="absolute top-0 right-0 m-5 p-2 bg-blue-500 text-white rounded-md">
        Logout
      </button>
      <h1 className="py-5 text-center text-5xl font-bold">
        Websocket - Motoko
      </h1>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <a
          href="https://github.com/iamenochchirima/ic-websockets-chat-mo"
          className="mb-2 text-blue-500 font-semibold"
        >
          Source code
        </a>
      </div>
      <div className="w-full h-full flex gap-5 items-center justify-center my-5">
        {ws && (ws.readyState === ws.OPEN) && (
          <h3 className="text-lg font-semibold">Websocket open</h3>
        )}
      </div>
    </div>
  );
};

export default Header;
