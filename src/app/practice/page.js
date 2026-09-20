import React from 'react';

export default function SalarySlip() {
  const attendanceRows = [
    [
      { date: "Thursday, July 16, 2026", status: "OFF" },
      { date: "Friday, July 17, 2026", status: "Off" },
      { date: "Saturday, July 18, 2026", status: "OFF" },
      { date: "Sunday, July 19, 2026", status: "OFF" },
      { date: "Monday, July 20, 2026", status: "Off" },
      { date: "Tuesday, July 21, 2026", status: "Off" },
      { date: "Wednesday, July 22, 2026", status: "Off" },
    ],
    [
      { date: "Thursday, July 23, 2026", status: "Off" },
      { date: "Friday, July 24, 2026", status: "Off" },
      { date: "Saturday, July 25, 2026", status: "OFF" },
      { date: "Sunday, July 26, 2026", status: "Off" },
      { date: "Monday, July 27, 2026", status: "Off" },
      { date: "Tuesday, July 28, 2026", status: "Off" },
      { date: "Wednesday, July 29, 2026", status: "Off" },
    ],
    [
      { date: "Thursday, July 30, 2026", status: "Off" },
      { date: "Friday, July 31, 2026", status: "Off" },
      { date: "Saturday, August 1, 2026", status: "OFF" },
      { date: "Sunday, August 2, 2026", status: "OFF" },
      { date: "Monday, August 3, 2026", status: "Present" },
      { date: "Tuesday, August 4, 2026", status: "Present" },
      { date: "Wednesday, August 5, 2026", status: "USL", highlight: true },
    ],
    [
      { date: "Thursday, August 6, 2026", status: "Present" },
      { date: "Friday, August 7, 2026", status: "Present" },
      { date: "Saturday, August 8, 2026", status: "OFF" },
      { date: "Sunday, August 9, 2026", status: "OFF" },
      { date: "Monday, August 10, 2026", status: "Present" },
      { date: "Tuesday, August 11, 2026", status: "Present" },
      { date: "Wednesday, August 12, 2026", status: "USL", highlight: true },
    ]
  ];

  return (
    <div className="p-6 bg-white max-w-7xl mx-auto text-xs font-sans text-black">
      {/* Top Header */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Dear</span>
          <span className="border border-green-700 px-2 py-0.5 min-w-[120px] inline-block font-semibold">
            Aftab
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold">Net Salary PKR</span>
          <span className="font-bold">14,318</span>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="border border-red-700 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          {/* Header Info Row 1 */}
          <thead>
            <tr className="bg-[#cc0000] text-white font-medium text-[11px]">
              <th className="p-1 border border-white">EMP ID</th>
              <th className="p-1 border border-white">Employee Name</th>
              <th className="p-1 border border-white">Payroll</th>
              <th className="p-1 border border-white">Campaign</th>
              <th className="p-1 border border-white">Basic</th>
              <th className="p-1 border border-white">Agent WD</th>
              <th className="p-1 border border-white">Pay Per Day</th>
            </tr>
            <tr className="bg-white text-black font-semibold">
              <td className="p-1 border border-gray-300">#20070</td>
              <td className="p-1 border border-gray-300">Aftab</td>
              <td className="p-1 border border-gray-300">16Jul,26 to 15-Aug-26</td>
              <td className="p-1 border border-gray-300">DO</td>
              <td className="p-1 border border-gray-300">35,000</td>
              <td className="p-1 border border-gray-300">M WD</td>
              <td className="p-1 border border-gray-300">1,591</td>
            </tr>
          </thead>

          <tbody>
            {/* Attendance Calendar Grid */}
            {attendanceRows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {/* Dates Header */}
                <tr className="bg-[#cc0000] text-white text-[10px]">
                  {row.map((col, colIndex) => (
                    <th key={colIndex} className="p-1 border border-white font-normal">
                      {col.date}
                    </th>
                  ))}
                </tr>
                {/* Status Values */}
                <tr>
                  {row.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-1 border border-gray-300 font-medium ${
                        col.highlight ? "bg-[#cc0000] text-white" : "bg-white text-black"
                      }`}
                    >
                      {col.status}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            ))}

            {/* Attendance Summary Section */}
            <tr className="bg-[#cc0000] text-white text-[10px]">
              <th className="p-1 border border-white font-normal">Thursday, August 13, 2026</th>
              <th className="p-1 border border-white font-normal">Friday, August 14, 2026</th>
              <th className="p-1 border border-white font-normal">Saturday, August 15, 2026</th>
              <th className="p-1 border border-white font-normal">Working Days</th>
              <th className="p-1 border border-white font-normal">Late</th>
              <th className="p-1 border border-white font-normal">Unpaid</th>
              <th className="p-1 border border-white font-normal">Paid Days</th>
            </tr>
            <tr>
              <td className="p-1 border border-gray-300">Present</td>
              <td className="p-1 border border-gray-300">Present</td>
              <td className="p-1 border border-gray-300">OFF</td>
              <td className="p-1 border border-gray-300">11</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">2</td>
              <td className="p-1 border border-gray-300 font-bold">9</td>
            </tr>

            {/* Leaves & Salary Calculation Row 1 */}
            <tr className="bg-[#cc0000] text-white text-[10px]">
              <th className="p-1 border border-white font-normal">Half Day</th>
              <th className="p-1 border border-white font-normal">Casual Leave</th>
              <th className="p-1 border border-white font-normal">Sick Leave</th>
              <th className="p-1 border border-white font-normal">NCNS/UCL/USL</th>
              <th className="p-1 border border-white font-normal">Salary</th>
              <th className="p-1 border border-white font-normal">Arrears (-ve)</th>
              <th className="p-1 border border-white font-normal">Arrears (+ve)</th>
            </tr>
            <tr>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">2</td>
              <td className="p-1 border border-gray-300 font-semibold">14318</td>
              <td className="p-1 border border-gray-300">PKR 0</td>
              <td className="p-1 border border-gray-300">PKR 0</td>
            </tr>

            {/* Allowance & Bonus Section */}
            <tr className="bg-[#cc0000] text-white text-[10px]">
              <th className="p-1 border border-white font-normal">Fatal Count</th>
              <th className="p-1 border border-white font-normal">Attendance Allowance</th>
              <th className="p-1 border border-white font-normal">Fatal (Other Category)</th>
              <th className="p-1 border border-white font-normal">Dependability Bonus</th>
              <th className="p-1 border border-white font-normal">Sales Incentive</th>
              <th className="p-1 border border-white font-normal">Fuel Allowance</th>
              <th className="p-1 border border-white font-normal">Additional Incentive</th>
            </tr>
            <tr>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">-</td>
              <td className="p-1 border border-gray-300">0</td>
              <td className="p-1 border border-gray-300">-</td>
              <td className="p-1 border border-gray-300">-</td>
            </tr>

            {/* Deductions & Net Salary Row */}
            <tr className="bg-[#cc0000] text-white text-[10px]">
              <th className="p-1 border border-white font-normal">Gross Salary</th>
              <th className="p-1 border border-white font-normal">Income Tax</th>
              <th className="p-1 border border-white font-normal">EOBI</th>
              <th className="p-1 border border-white font-normal">Van Charges</th>
              <th className="p-1 border border-white font-normal">Parking Charges</th>
              <th className="p-1 border border-white font-normal">Advance Salary</th>
              <th className="p-1 border border-white font-normal">Net Salary</th>
            </tr>
            <tr>
              <td className="p-1 border border-gray-300">PKR 0</td>
              <td className="p-1 border border-gray-300">PKR 0</td>
              <td className="p-1 border border-gray-300">PKR 0</td>
              <td className="p-1 border border-gray-300">-</td>
              <td className="p-1 border border-gray-300">-</td>
              <td className="p-1 border border-gray-300">-</td>
              <td className="p-1 border border-gray-300 font-bold">14,318</td>
            </tr>

            {/* Bottom Footer Details */}
            <tr className="bg-[#cc0000] text-white text-[10px]">
              <th className="p-1 border border-white font-normal">Referral Bonus</th>
              <th className="p-1 border border-white font-normal">Anniversary</th>
              <th className="p-1 border border-white font-normal">Birthday</th>
              <th className="p-1 border border-white font-normal">Salary Processed</th>
              <th className="p-1 border border-white font-normal">Pending</th>
              <th className="p-1 border border-white font-normal">Advance Due</th>
              <th className="p-1 border border-white font-normal">Account No</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}