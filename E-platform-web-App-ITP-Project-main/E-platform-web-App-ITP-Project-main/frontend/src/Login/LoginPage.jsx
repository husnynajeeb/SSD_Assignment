import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Shared/Components/context/authcontext";
import { Input, Button, Typography } from "@material-tailwind/react";
import Toast from "../Shared/Components/UiElements/Toast/Toast";

export const LoginPage = () => {
  const auth = useContext(AuthContext);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  axios.get("http://localhost:5000/me", { withCredentials: true })
    .then(res => {
      if (res.data.user) {
        auth.login(res.data.user._id);
      } else {
        auth.logout();
      }
    })
    .catch(() => auth.logout());
}, [auth]);

  // ✅ Normal login
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        "http://localhost:5000/login/",
        { mail, password },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.message === "Success") {
          auth.login(res.data.user._id);
          Toast("Login Successfully !!", "success");
          navigate("/Products");
        } else {
          Toast("Invalid email / Password", "error");
        }
      })
      .catch((err) => {
        console.error(err);
        Toast("Login failed. Try again.", "error");
      });
  };

  // ✅ Google login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div
      className="h-screen"
      style={{
        backgroundImage: `url('/img/cuslogin.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <section className="m-8 pt-14 flex gap-4">
        {/* Left Side - Form */}
        <div className="w-full lg:w-3/5 mt-24">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mb-4">
              Sign In
            </Typography>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="text-lg font-normal"
            >
              Enter your email and password to Sign In.
            </Typography>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
          >
            <div className="mb-1 flex flex-col gap-6">
              <Typography
                variant="small"
                color="blue-gray"
                className="-mb-3 font-medium"
              >
                Your email
              </Typography>
              <Input
                size="lg"
                type="email"
                placeholder="name@mail.com"
                onChange={(e) => setMail(e.target.value)}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900 placeholder:text-gray-500 placeholder:opacity-100"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />

              <Typography
                variant="small"
                color="blue-gray"
                className="-mb-3 font-medium"
              >
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900 placeholder:text-gray-500 placeholder:opacity-100"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            {/* Normal Login Button */}
            <Button className="mt-6" fullWidth type="submit">
              Sign In
            </Button>

            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleLogin}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              fullWidth
              type="button"
            >
              Sign in with Google
            </Button>

            <Typography
              variant="paragraph"
              className="text-center text-blue-gray-500 font-medium mt-4"
            >
              Not registered?
              <Link to="/Customer/create" className="text-gray-900 ml-1">
                Create account
              </Link>
            </Typography>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="w-2/5 h-full hidden lg:block">
          <img
            src="/img/items.jpg"
            className="h-full w-full object-cover rounded-3xl"
            alt="Login"
          />
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
