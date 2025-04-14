import { useEffect } from "react";
import Login from "./components/Auth";
import Profile from "./components/Profile";
import { useUser } from "./context/user";
import { getMe } from "./api/profile";

const App = () => {
  const { isLoggedIn, login } = useUser();
  useEffect(() => {
    const fetchMe = async () => {
      const res = await getMe();
      if (res) {
        const data = res.data;
        login({
          id: data._id,
          username: data.username,
          email: data.email,
          phoneNo: data?.phoneno,
        });
      }
    };

    fetchMe();
  }, []);
  return <div>{!isLoggedIn ? <Login /> : <Profile />}</div>;
};

export default App;
