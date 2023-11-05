import { useEffect } from "react";
import Chat from "./Components/Chat";
import Header from "./Components/Header";
import { useAuth } from "./Components/Context";

const App = () => {
  const { isAuthenticated, login, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="bg-gray-900 text-gray-300 max-h-full">
      {!isAuthenticated ? (
        <div className="p-2 flex flex-col items-center justify-center h-screen mx-10">
          <div className="mt-5">
            <button
              onClick={login}
              className="p-2 text-white border px-5 py-2 border-gray-400 rounded flex-grow-0"
            >
              Login with Internet Identity
            </button>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <Chat />
        </>
      )}
    </div>
  );
};

export default App;
