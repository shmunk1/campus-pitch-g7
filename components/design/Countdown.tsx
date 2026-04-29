"use client";
import { splitAbsolute, urgencyTone } from "@/lib/utils-pitch";

export default function Countdown({ deadline }: { deadline: string }) {
  const { datePart, timePart } = splitAbsolute(deadline);
  const tone = urgencyTone(deadline);
  return (
    <div className="cp-cd-block" data-tone={tone}>
      <div className="cp-cd-num--date">{timePart}</div>
      <div className="cp-cd-lbl">{datePart}</div>
    </div>
  );
}
