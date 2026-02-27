useEffect(() => {
  const init = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("SESSION DATA:", data);
    console.log("SESSION ERROR:", error);

    setUser(data.session?.user ?? null);
    setLoading(false);
  };

  init();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log("AUTH CHANGE:", session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
