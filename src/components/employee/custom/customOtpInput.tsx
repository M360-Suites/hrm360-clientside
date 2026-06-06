import { useOnboardingStore } from "@/store/staff/onboarding_store";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function CustomInputOtp() {
  const { code, setCode } = useOnboardingStore();
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
            className="lg:h-20 lg:w-20 md:w-12.5 md:h-12.5 w-10 h-10 rounded-[10px]"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
