import APICatalogDashboard from "@/components/api-catalog-dashboard";
import type { Catalog, Category } from "@/lib/api";


interface Props {
    role: "admin" | "user";
}

export default function APICatalogView({ role }: Props) {
    return <APICatalogDashboard role={role} />;
}
