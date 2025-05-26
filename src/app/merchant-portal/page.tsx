"use client";

export default function MerchantPortalRedirect() {
  // const { user  }  = useAuth();

  // useEffect(() => {
  //   if (user) {
  //     // Redirect to the merchant's dashboard
  //   }
  // }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
          Redirecting...
        </h2>
        <p className="text-body-color dark:text-body-color-dark">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
}
