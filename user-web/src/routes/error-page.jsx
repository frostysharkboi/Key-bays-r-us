import { useRouteError } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <Header showAccountMenu={false} />
      <h1><b>BŁĄD</b></h1>
      <p>No i chuj bąbki strzelił. Popisałeś się wiesz?<br />Niżej masz błąd, wiedz co zjepsułeś</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>

      <a href="/"><p>Wróć się na stronę główną</p></a>
      <Footer />
    </div>
  );
}
