import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/app-state";
import welcomeLogo from "@/assets/qpi-welcome-logo.png";
import welcomePaper from "@/assets/welcome-paper.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QPi.money — Welcome" },
      { name: "description", content: "Earn trust, not just income. Join QPi.money to discover offers and create your own storefront." },
      { property: "og:title", content: "QPi.money — Welcome" },
      { property: "og:description", content: "Earn trust, not just income. Join QPi.money to discover offers and create your own storefront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted">
      <main className="welcome-screen">
        <img src={welcomePaper} alt="" width={768} height={1536} className="welcome-paper" />
        <div className="welcome-brand">
          <h1 className="sr-only">QPi.money</h1>
          <img src={welcomeLogo} alt="QPi" width={1152} height={576} className="welcome-logo" />
        </div>
        <p className="welcome-tagline">Earn trust, not<br />just income.</p>
        <div className="welcome-actions">
          <Button
            onClick={() => {
              signIn();
              navigate({ to: "/discover" });
            }}
            className="welcome-login"
          >
            Login
          </Button>
          <Button disabled variant="secondary" title="Sign up opens soon" className="welcome-signup">Sign up</Button>
        </div>
      </main>
    </div>
  );
}
