import { useState } from "react";
import { BaseLayout } from "@/components/layouts/BaseLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { usePayment } from "@/hooks/use-payment";

interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  credits_per_month: number;
  is_popular: boolean;
  sort_order: number;
}

const plans: PricingPlan[] = [
  {
    id: "1",
    slug: "basic",
    name: "Basic",
    description: "Perfect for trying out SousChef",
    price_monthly: 299,
    price_yearly: 2999,
    features: [
      "10 meal plans per month",
      "5 recipe finder uses",
      "5 healthy alternatives",
      "Basic nutritional tracking",
      "Email support"
    ],
    credits_per_month: 10,
    is_popular: false,
    sort_order: 1
  },
  {
    id: "2",
    slug: "pro",
    name: "Pro",
    description: "Best for health enthusiasts",
    price_monthly: 599,
    price_yearly: 5999,
    features: [
      "30 meal plans per month",
      "20 recipe finder uses",
      "20 healthy alternatives",
      "Advanced macro tracking",
      "Priority support",
      "Save & share meal plans",
      "Custom meal preferences"
    ],
    credits_per_month: 30,
    is_popular: true,
    sort_order: 2
  },
  {
    id: "3",
    slug: "ultimate",
    name: "Ultimate",
    description: "For professionals and families",
    price_monthly: 999,
    price_yearly: 9999,
    features: [
      "Unlimited meal plans",
      "Unlimited recipe finder",
      "Unlimited alternatives",
      "Advanced macro tracking",
      "24/7 priority support",
      "Save & share meal plans",
      "Custom meal preferences",
      "API access",
      "Team collaboration"
    ],
    credits_per_month: 999999,
    is_popular: false,
    sort_order: 3
  }
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { initiatePayment, isLoading: isPaymentLoading } = usePayment({
    onInitiateSuccess: (response) => {
      console.log('Payment initiated:', response.data.merchantTransactionId);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = async (plan: PricingPlan) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Not Logged In",
          description: "Please log in to subscribe to a plan.",
          variant: "destructive"
        });
        return;
      }

      await initiatePayment({
        amount: isYearly ? plan.price_yearly : plan.price_monthly,
        userId: session.user.id,
        callbackUrl: `${window.location.origin}/payment/callback?plan=${plan.slug}`,
        redirectUrl: `${window.location.origin}/payment/success`,
        mobileNumber: session.user.phone // Optional: Add if you have user's phone number
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your meal planning needs. All plans include access to our AI-powered features.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={!isYearly ? "text-primary font-medium" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={isYearly ? "text-primary font-medium" : "text-muted-foreground"}>
              Yearly
              <span className="ml-1.5 text-xs inline-block py-0.5 px-2 bg-primary/10 text-primary rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white/80 backdrop-blur-sm border-0 shadow-sm p-8 ${
                plan.is_popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">₹{isYearly ? plan.price_yearly : plan.price_monthly}</span>
                  <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{Math.round(plan.price_yearly / 12)} per month, billed annually
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                className="w-full"
                variant={plan.is_popular ? "default" : "outline"}
                disabled={isLoading || isPaymentLoading}
              >
                {isLoading || isPaymentLoading ? 'Processing...' : 'Get Started'}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit/debit cards, UPI, and net banking through our secure payment gateway.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What happens if I run out of credits?</h3>
              <p className="text-muted-foreground">
                You can purchase additional credits or wait until your next billing cycle when your credits refresh.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We do not offer refunds for subscriptions. All sales are final. Please try our free features before subscribing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}