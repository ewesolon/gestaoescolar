import AppRouter from "./routes/AppRouter";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import { NotificationProvider } from "./context/NotificationContext";
import ToastContainer from "./components/Toast";

interface AppProps {
  routerConfig?: {
    future: {
      v7_startTransition: boolean;
      v7_relativeSplatPath: boolean;
    };
  };
}

export default function App({ routerConfig }: AppProps) {
  return (
    <NotificationProvider>
      <CarrinhoProvider>
        <AppRouter routerConfig={routerConfig} />
        <ToastContainer />
      </CarrinhoProvider>
    </NotificationProvider>
  );
}
