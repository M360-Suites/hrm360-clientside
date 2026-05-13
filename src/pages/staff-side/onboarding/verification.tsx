import { CustomInputOtp } from "@/components/employee/custom/customOtpInput";
import { useOnboardingStore } from "@/store/staff/onboarding_store";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router";
import { useState } from "react";

const StepData = [
  {
    title: "You are about to join",
    description: `Enter code sent to `,
    step: 1
  },
  {
    title: "Join your team/department",
    description: "Select  the team you belong to enjoy personalized experience",
    step: 2
  }
];

const teamData = [
  {
    name: "Marketing and Sales",
    value: "marketing_and_sales"
  },
  {
    name: "Tech and Operations",
    value: "tech_and_operations"
  },
  {
    name: "Finance and Accounting",
    value: "finance_and_accounting"
  },
  {
    name: "Human Resources",
    value: "human_resources"
  }
]

export const Verification = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";
  
  const {onboardingSteps, error, code, loading, completeOnboarding} = useOnboardingStore();
  const currentStep = StepData.find(step => step.step === onboardingSteps);
  const [selectedTeam, setSelectedTeams] = useState({
    name: "",
    value: ""
  });

  

  const isDisabled = onboardingSteps === 1 ? code.trim().length < 5 : selectedTeam.name === '';

  const handleStepsAndVerify = async() => {
    // prevent action when disabled
    if (isDisabled) return;
    console.log("Current onboarding step:", onboardingSteps, "Email from params:", emailFromParams);
      const success = await completeOnboarding({ password: code, email: emailFromParams });
      if (success) {
        navigate("/employee/set-password");
      }
  }

  const handleTeamSelect = (team: {name:string, value: string}) => {
    setSelectedTeams(team);
  }

  return (
    <div className={`flex flex-col ${onboardingSteps === 1 ? "gap-21 max-md:gap-6": "gap-10 max-md:gap-6"} w-full justify-center items-center max-md:pt-10 max-md:relative`}>
      <div className="flex flex-col gap-3 max-md:gap-2 px-5 max-md:px-0 self-start max-w-[532px] max-md:w-full max-md:self-start">
        <h1 className="text-4xl/[100%] max-md:text-2xl/[120%] font-semibold">{currentStep?.title}</h1>
        <div className="flex items-center gap-1">
          <p className="text-[#4A4A4A] text-lg max-md:text-sm/[100%] font-normal">{currentStep?.description} </p>
          <span className="font-semibold">{emailFromParams}</span>
        </div>
      </div>
        {error && (
        <div className="mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div>
        {currentStep?.step === 1 ? (
          <div className="flex flex-col gap-6 max-md:gap-4 px-5 justify-center items-center w-[532px] max-md:w-full">
            <CustomInputOtp />
            {/* <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <p className="text-base max-md:text-xs/[100%] text-[#4A4A4A] font-normal">Didn&apos;t receive the code?</p>
                <button className="text-[#4C0BFD] max-md:text-xs/[100%] text-base font-semibold cursor-pointer">Resend Code</button>
              </div>
              <span className="text-base max-md:text-xs/[100%] text-[#4A4A4A] font-normal">
                00:15
              </span>
            </div> */}
      </div>
        ): (
          <div className="flex flex-col gap-5 justify-center items-start w-[532px]">
            {teamData.map((data,index)=> (
              <button key={index} className={`flex items-center cursor-pointer gap-2 p-6 border rounded-lg w-md ${selectedTeam.name === data.name && "border-[#4C0BFD]"}`} onClick={()=>{
                handleTeamSelect(data)
              }}>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedTeam.name === data.name && "border-[#4C0BFD]"}`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedTeam.name === data.name ? "bg-[#4C0BFD]" : "bg-transparent"}`} />
                </div>
                <span className="text-base text-[#4A4A4A] font-normal">{data.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between w-full px-16 max-md:fixed max-md:bottom-5 max-md:left-0 max-md:right-0 max-md:px-4 max-md:py-3  z-50">
        <div className="border border-gray-200 max-md:hidden bg-transparent h-3.5 w-[250px] rounded-full">
          <div style={{
            width: `${(onboardingSteps / StepData.length) * 100}%`,                 
            backgroundColor: '#7948FD',
            height: '100%',
            borderRadius: 'inherit'
          }} />
        </div>
          <button disabled={isDisabled} className="bg-[#3702C8] disabled:bg-[#A4A4A4] text-white  max-md:w-full cursor-pointer disabled:cursor-not-allowed text-base font-medium px-8 py-3.5 rounded-lg" onClick={handleStepsAndVerify}>
            {currentStep?.step === 1 && <span>{loading ? "Verifying..." : "Verify"}</span>}
          </button>    
      </div>
    </div>
  )
};
