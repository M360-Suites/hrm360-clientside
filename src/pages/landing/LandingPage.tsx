import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Steps } from "./components/Steps";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-slate-50 font-sans selection:bg-[#3b00d9]/20 selection:text-[#3b00d9]">
			<Navbar />
			<main>
				<Hero />
				<Features />
				<Steps />
				<Testimonials />
				<FAQ />
				<CTA />
			</main>
			<Footer />
		</div>
	);
};

export default LandingPage;
