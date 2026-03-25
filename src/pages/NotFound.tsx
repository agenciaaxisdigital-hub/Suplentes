import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-lg text-muted-foreground">Página não encontrada</p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
