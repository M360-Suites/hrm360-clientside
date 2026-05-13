import { useOnboardingStore } from "@/store/staff/onboarding_store";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function CustomInputOtp() {
  const { code, setCode } = useOnboardingStore();
  console.log("Current code value:", code); // Debugging log to check the current value of code
  return (
    <InputOTP
      maxLength={6}
      value={code}
      onChange={(val: string) => setCode(val.trim())}
      className="w-full"
    >
      <InputOTPGroup className="gap-3 max-md:gap-1">
        {[...Array(6)].map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="h-[80px] w-[85px] max-md:w-[50px] max-md:h-[50px] rounded-[10px]"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
