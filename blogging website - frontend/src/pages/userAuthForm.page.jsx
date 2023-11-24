import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";

const UserAuthForm = ({ myType }) => {
  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        console.log(data);
        console.log(sessionStorage);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = myType == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    //form data
    let form = new FormData(formElement);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    // console.log(formData);

    //form validation
    let { fullname, email, password } = formData;
    if (myType === "sign-up" && (!fullname || fullname.length < 3)) {
      return toast.error("Full name must be at least three letters long.");
    }

    if (!email.length) {
      return toast.error("You must enter email.");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Invalid email format.");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be 6-20 characters long with a numeric, one lowercase, and one uppercase letter."
      );
    }
    console.log(formData);

    //make req to server
    userAuthThroughServer(serverRoute, formData);
  };

  return (
    <>
      <AnimationWrapper keyValue={myType}>
        <section className="h-cover flex items-center justify-center">
          <Toaster />
          <form id="formElement" className="w-[80%] max-w-[400px]">
            <h1
              className="text-4xl font-gelasio capitalize text-center
          mb-24"
            >
              {myType == "sign-in" ? "Welcom back" : "Join us today"}
            </h1>

            {myType != "sign-in" ? (
              <InputBox
                name="fullname"
                type="age"
                placeholder="Full name"
                icon="fi-rr-user"
              />
            ) : (
              ""
            )}

            <InputBox
              name="email"
              type="email"
              placeholder="Email"
              icon="fi-rr-envelope"
            />

            <InputBox
              name="password"
              type="password"
              placeholder="Password"
              icon="fi-rr-key"
            />

            <button
              className="btn-dark center mt-14"
              type="submit"
              onClick={handleSubmit}
            >
              {myType.replace("-", " ")}
            </button>
            <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
              <hr className="w-1/2 border-black" />
              <p>or</p>
              <hr className="w-1/2 border-black" />
            </div>
            <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
              <img src={googleIcon} className="w-5" />
              Continue With Google
            </button>

            {myType == "sign-in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don't have an account?
                <Link
                  to="/signup"
                  className="underline text-black text-xl ml-1"
                >
                  Join us today
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Already a member?
                <Link
                  to="/signin"
                  className="underline text-black text-xl ml-1 "
                >
                  Sign in here.
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default UserAuthForm;
