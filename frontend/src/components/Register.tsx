
import toast from "react-hot-toast";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  useNavigate } from "react-router-dom";

export default function Register() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: ""
  });
  const navigate = useNavigate();
  const BASE_URL = "http://127.0.0.1:8000/";

  async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    console.log("data collected ", formData)
    try {
      const response = await fetch(`${BASE_URL}register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        toast.error("Email already registered");
      } else {
        toast.success("Registration successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Error:", error);
    }
  }

  return (
    <div className="min-h-screen shh bg-black text-white">
      {/* Main Content */}
      <div className="flex  min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 p-12 justify-center flex-col  bg-neutral-900  items-center">
          <span className="w-[64px] h-[64px] bg-neutral-600 rounded-[15px] border border-fill flex items-center justify-center mx-auto text-foreground mb-4"><svg height="34" viewBox="0 0 90 73" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M38.5603 3.92183C38.701 1.89172 37.1671 0.13609 35.1342 0.000515472C33.1013 -0.135058 31.3393 1.40077 31.1986 3.43087L28.2153 46.4735L28.2152 46.4757C28.0745 48.5053 29.6078 50.2608 31.6402 50.3969C33.6727 50.533 35.4349 48.9983 35.5768 46.9687L35.5769 46.9666L36.4002 35.1871C36.5923 32.4387 38.7534 30.231 41.5011 29.9764C44.448 29.7033 47.0968 31.7578 47.5587 34.6749L49.7973 48.8125C50.1153 50.8215 52.0049 52.1886 54.0177 51.8661C56.0304 51.5437 57.4042 49.6537 57.0862 47.6448L54.8476 33.5071C53.7793 26.7601 47.6528 22.0082 40.8367 22.6399C39.5621 22.758 38.3421 23.0578 37.2025 23.513L38.5603 3.92183ZM62.784 3.97984C62.3643 1.98733 60.4088 0.712117 58.4164 1.13158C56.4239 1.55105 55.1489 3.50635 55.5686 5.49887L61.2028 32.2456L62.9918 40.7386C63.4115 42.7311 65.367 44.0063 67.3594 43.5869C69.3519 43.1674 70.6269 41.2121 70.2072 39.2196L68.4181 30.7266C67.8711 28.1297 69.2871 25.5193 71.7621 24.5619C74.4656 23.5161 77.5134 24.7855 78.6756 27.4413L82.9237 37.1488C83.74 39.0143 85.914 39.8649 87.7794 39.0488C89.6448 38.2327 90.4952 36.0588 89.6789 34.1934L85.4308 24.4859C82.6857 18.2129 75.4868 15.2146 69.1011 17.6848C67.9804 18.1183 66.9515 18.6953 66.0297 19.3881L62.784 3.97984ZM14.9399 12.8875C12.0574 12.6865 9.22152 13.7004 7.11888 15.6836C2.13362 20.3858 3.01181 28.5449 8.88287 32.0723L12.7277 34.3824C15.0641 35.7861 15.2664 39.0966 13.1185 40.777L12.9335 40.9218C12.0264 41.6315 10.8251 41.8419 9.73129 41.4826C8.59946 41.1109 7.74008 40.1811 7.45839 39.0235L7.28103 38.2947C6.79965 36.3166 4.80549 35.1042 2.82695 35.5867C0.848411 36.0692 -0.365276 38.064 0.116104 40.0421L0.293468 40.7709C1.17745 44.4035 3.87433 47.3213 7.42622 48.488C10.8587 49.6155 14.6285 48.9552 17.4753 46.7279L17.6603 46.5832C23.8815 41.7159 23.2954 32.1273 16.5283 28.0615L12.6835 25.7514C10.9978 24.7386 10.7457 22.396 12.177 21.0459C12.7807 20.4765 13.5949 20.1854 14.4225 20.2431L15.0746 20.2886C16.2495 20.3705 17.2282 21.2195 17.4751 22.3709C17.9021 24.3615 19.8622 25.6282 21.8532 25.2001C23.8442 24.772 25.1121 22.8112 24.6852 20.8206C23.7497 16.4591 20.0425 13.2433 15.5919 12.933L14.9399 12.8875ZM19.7557 52.8305C21.4655 51.7272 23.7487 52.2197 24.8553 53.9305C29.6371 61.3231 39.9857 65.9998 51.5498 64.2908C63.114 62.5818 71.6469 55.1148 74.0592 46.6591C74.6174 44.7023 76.6578 43.5708 78.6165 44.132C80.5752 44.6931 81.7105 46.7343 81.1522 48.6912C77.8214 60.3669 66.5846 69.5227 52.6402 71.5835C38.6958 73.6442 25.2661 68.1336 18.6634 57.9258C17.5568 56.2151 18.0458 53.9338 19.7557 52.8305Z" fill="white"></path></svg></span>
          <div className="space-y-4 pt-4 max-w-72 text-center">
            <blockquote className="text-3xl font-bold leading-normal">
              Invite anyone to join your private chat
            </blockquote>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

          <a
            href="/login"
            className="text-sm absolute right-10 top-10  text-neutral-400 hover:text-white transition-colors"
          >
            Login
          </a>

          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-neutral-400">
                Enter your email below to create your account
              </p>
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-6 p-4 bg-neutral-800 rounded-lg shadow-md">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="full_name" className="text-sm text-neutral-400 mb-1">Full Name</label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={
                      formData.first_name || formData.last_name
                        ? `${formData.first_name} ${formData.last_name}`.trim()
                        : ""
                    }
                    onChange={(e) => {
                      const [firstname, ...lastnameParts] = e.target.value.split(' ');
                      const lastname = lastnameParts.join(' ');
                      setFormData({
                        ...formData,
                        first_name: firstname || '',
                        last_name: lastname || '',
                      });
                    }}
                    className="bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm text-neutral-400 mb-1">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col">
                  <label htmlFor="password" className="text-sm text-neutral-400 mb-1">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-neutral-200">
                Sign Up
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

