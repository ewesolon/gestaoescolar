// Tipos para compatibilidade com React Router v7
declare module "react-router-dom" {
  import { ComponentType, ReactNode } from "react";

  interface BrowserRouterProps {
    future?: {
      v7_startTransition?: boolean;
      v7_relativeSplatPath?: boolean;
    };
    children?: ReactNode;
  }

  interface RouteProps {
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }

  interface RoutesProps {
    children?: ReactNode;
  }

  interface NavigateProps {
    to: string;
    replace?: boolean;
  }

  interface LinkProps {
    to: string;
    children?: ReactNode;
    [key: string]: any;
  }

  interface UseParamsReturn {
    [key: string]: string | undefined;
  }

  interface UseNavigateReturn {
    (to: string, options?: { replace?: boolean }): void;
  }

  interface UseLocationReturn {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  }

  export function BrowserRouter(props: BrowserRouterProps): JSX.Element;
  export function Routes(props: RoutesProps): JSX.Element;
  export function Route(props: RouteProps): JSX.Element;
  export function Navigate(props: NavigateProps): JSX.Element;
  export function Link(props: LinkProps): JSX.Element;

  export function useParams(): UseParamsReturn;
  export function useNavigate(): UseNavigateReturn;
  export function useLocation(): UseLocationReturn;
}

// Configuração global para React Router v7
declare global {
  interface Window {
    __REACT_ROUTER_V7_FEATURES__?: {
      v7_startTransition: boolean;
      v7_relativeSplatPath: boolean;
    };
  }
}
