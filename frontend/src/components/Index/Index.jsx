import HeaderIndex from "./HeaderIndex";
import FooterIndex from "./FooterIndex";
import HeroIndex from "./HeroIndex";
import Features from "./Features";

export default function Index() {
  return (
    <div>
      <HeaderIndex />
      <HeroIndex />
      <Features />
      <FooterIndex />
    </div>
  );
}