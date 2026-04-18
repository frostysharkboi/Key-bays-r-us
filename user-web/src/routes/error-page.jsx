import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1><b>BŁĄD</b></h1>
      <p>No i chuj bąbki strzelił. Popisałeś się wiesz?<br/>Niżej masz błąd, wiedz co zjebałeś</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>

      <a href="/"><p>Wróć się na stronę główną</p></a>
    </div>
  );
}
