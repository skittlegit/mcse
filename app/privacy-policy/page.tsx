export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "OVERVIEW",
      body: `MCSE (Mock Capital Stock Exchange) is a simulated stock trading platform built for educational purposes. No real money, securities, or financial instruments are involved. This Privacy Policy explains how we handle your information when you use the application.`,
    },
    {
      title: "INFORMATION WE COLLECT",
      body: `When you create an account, we collect your name and email address. During use, the app stores simulated trading data such as portfolio holdings, watchlists, orders, and preferences. All trading activity is fictional and carries no real financial value.`,
    },
    {
      title: "HOW WE USE YOUR INFORMATION",
      body: `Your information is used solely to provide and improve the MCSE experience. This includes maintaining your account, displaying your simulated portfolio, saving your preferences (such as theme and display settings), and enabling app functionality. We do not use your data for advertising or marketing purposes.`,
    },
    {
      title: "LOCAL STORAGE",
      body: `MCSE stores certain preferences and session data locally on your device using browser local storage. This data remains on your device and is not transmitted to external servers unless required for core app functionality.`,
    },
    {
      title: "DATA SHARING",
      body: `We do not sell, trade, or share your personal information with third parties. Your simulated trading data is not shared with any external services, analytics providers, or advertisers.`,
    },
    {
      title: "DATA SECURITY",
      body: `We implement reasonable security measures to protect your information. However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data.`,
    },
    {
      title: "CHILDREN\u2019S PRIVACY",
      body: `MCSE is an educational tool and may be used by students. We do not knowingly collect personal information from children under 13 without parental consent. If you believe a child under 13 has provided us with personal information, please contact us so we can take appropriate action.`,
    },
    {
      title: "CHANGES TO THIS POLICY",
      body: `We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date. Continued use of the app after changes constitutes acceptance of the revised policy.`,
    },
    {
      title: "CONTACT",
      body: `If you have questions or concerns about this Privacy Policy or your data, please reach out to the MCSE development team through the Support page within the application.`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <header className="mb-16">
        <p className="text-[10px] tracking-[0.2em] text-white/30 mb-3">LEGAL</p>
        <h1 className="font-[var(--font-anton)] text-4xl md:text-5xl tracking-[0.04em] leading-tight">
          Privacy Policy
        </h1>
        <p className="text-[11px] tracking-[0.12em] text-white/35 mt-4">
          EFFECTIVE DATE — APRIL 12, 2026
        </p>
      </header>

      <div className="space-y-10">
        {sections.map((s, i) => (
          <section key={i} className="border-t border-white/8 pt-8">
            <h2 className="text-[10px] tracking-[0.18em] text-white/40 mb-4 font-semibold">
              {s.title}
            </h2>
            <p className="text-[13px] leading-[1.8] text-white/60">{s.body}</p>
          </section>
        ))}
      </div>

      <footer className="mt-20 border-t border-white/8 pt-8">
        <p className="text-[10px] tracking-[0.15em] text-white/25">
          MCSE — MOCK CAPITAL STOCK EXCHANGE
        </p>
      </footer>
    </div>
  );
}
