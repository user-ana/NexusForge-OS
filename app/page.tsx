import { redirect } from "next/navigation";

// El middleware se encargará de verificar la sesión y redirigir correctamente
export default function RootPage() {
  redirect("/dashboard");
}
