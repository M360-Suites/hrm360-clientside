import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Forget Password?</h2>
        <p className="text-gray-500">It happens to the best of us.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Email to get password back</label>
          <input 
            type="email" 
            placeholder="bloomingdesigner@gmail.com" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9] transition-all text-sm placeholder:text-gray-400"
          />
        </div>

        <button className="w-full py-3.5 bg-[#3B00D9] hover:bg-[#3500c0] text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30">
          Continue
        </button>
        
        <div className="text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
