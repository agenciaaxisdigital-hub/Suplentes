import Cadastro from "./Cadastro";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <Cadastro onSaved={() => navigate("/cadastros")} />
    </PageTransition>
  );
}
