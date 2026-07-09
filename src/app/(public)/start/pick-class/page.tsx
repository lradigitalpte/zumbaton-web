import { Suspense } from "react";
import PickClassClient from "./PickClassClient";

export default function StartPickClassPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f4ee]" />}>
      <PickClassClient />
    </Suspense>
  );
}
