import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import { useRef, useState } from 'react';

const DietHistoryModal = ({ isOpen, onClose, dietPlan }) => {
    const pdfRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    if (!isOpen || !dietPlan) return null;

const handleDownloadPDF = () => {
    try {
        setDownloading(true);

        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        let y = margin;

        // Title
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("Weekly Diet Plan", margin, y);

        y += 10;

        // Created date
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        const createdDate = new Date(dietPlan.createdAt);

        pdf.text(
            `Created on: ${createdDate.toLocaleString()}`,
            margin,
            y
        );

        y += 12;

        Object.entries(dietPlan.weeklyPlan).forEach(([day, meals]) => {

            // Check if there is enough space for the day heading
            if (y > pageHeight - 25) {
                pdf.addPage();
                y = margin;
            }

            // Day heading
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text(day, margin, y);

            y += 8;

            // Day content
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");

            const lines = meals.split("\n").map((line) =>
                  line
                      .trim()
                      .replace(/^#{1,6}\s*/g, '')
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
              );

            lines.forEach((line) => {
                const text = line.trim();

                if (!text) {
                    y += 3;
                    return;
                }

                const wrappedLines = pdf.splitTextToSize(
                    text,
                    contentWidth
                );

                wrappedLines.forEach((wrappedLine) => {

                    if (y > pageHeight - 15) {
                        pdf.addPage();
                        y = margin;
                    }

                    pdf.text(wrappedLine, margin, y);
                    y += 5;
                });
            });

            y += 8;
        });

        const date = new Date(dietPlan.createdAt)
            .toISOString()
            .split("T")[0];

        pdf.save(`Diet-Plan-${date}.pdf`);

        toast.success("Diet plan downloaded successfully!");

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to download diet plan");
    } finally {
        setDownloading(false);
    }
};

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Header */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center justify-between gap-4">

                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Weekly Diet Plan History
                                </h2>

                                <p className="text-gray-400 mt-2">
                                    Created on:{" "}
                                    {new Date(dietPlan.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 
                                           disabled:cursor-not-allowed text-white px-5 py-3 
                                           rounded-xl transition-all"
                            >
                                {downloading ? "Downloading..." : "Download PDF"}
                            </button>

                        </div>
                    </div>

                    {/* PDF Content */}
                    <div
                        ref={pdfRef}
                        className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {Object.entries(dietPlan.weeklyPlan).map(([day, meals]) => (
                            <div
                                key={day}
                                className="bg-gray-900/50 rounded-xl p-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {day}
                                </h3>

                                <div className="space-y-4">
                                    {meals.split('\n').map((line, index) => (
                                        <p key={index} className="text-gray-300 text-sm">
                                            {line
                                                .trim()
                                                .replace(/^#{1,6}\s*/g, '')
                                                .replace(/\*\*/g, '')
                                                .replace(/\*/g, '')
                                            }
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DietHistoryModal;