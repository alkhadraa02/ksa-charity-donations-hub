import type { Metadata } from "next";
import { VolunteerStatusSelect } from "@/components/volunteer-status-select";
import { availabilityLabel, interestLabel } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "المتطوعون" };

export default async function AdminVolunteers() {
  const volunteers = await prisma.volunteer.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const fresh = volunteers.filter((v) => v.status === "NEW").length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">المتطوعون</h1>
      <p className="text-ink-soft">
        {formatNumber(volunteers.length)} طلباً · {formatNumber(fresh)} جديد
      </p>
      {volunteers.length === 0 ? (
        <p className="card p-6 text-ink-soft">لا توجد طلبات تطوع بعد.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>المدينة</th>
                <th>التواصل</th>
                <th>المجالات</th>
                <th>التفرغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id}>
                  <td className="font-semibold">{v.name}</td>
                  <td>{v.city}</td>
                  <td>
                    <span dir="ltr" className="block">{v.phone}</span>
                    <span dir="ltr" className="block text-ink-soft">{v.email}</span>
                  </td>
                  <td>
                    {v.interests
                      .split(",")
                      .filter(Boolean)
                      .map(interestLabel)
                      .join("، ")}
                  </td>
                  <td>{availabilityLabel(v.availability)}</td>
                  <td>{formatDate(v.createdAt)}</td>
                  <td>
                    <VolunteerStatusSelect id={v.id} status={v.status} name={v.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
