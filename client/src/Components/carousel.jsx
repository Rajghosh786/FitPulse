import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
// replace icons with your own if needed
import {
    FiCircle,
    FiCode,
    FiFileText,
    FiLayers,
    FiLayout,
} from "react-icons/fi";

const DEFAULT_ITEMS = [
    {
        title: "Inspiration ",
        description: "Let your dreams fly beyond limits.",
        id: 1,
        image: "https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        title: "Persistence",
        description: "Keep grinding. The top is lonely but worth it.",
        id: 2,
        image: "https://images.pexels.com/photos/841131/pexels-photo-841131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        title: "Innovation",
        description: "Think different. Be original.",
        id: 3,
        image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        title: "Growth",
        description: "Every step counts. Even the small ones.",
        id: 4,
        image: "https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        title: "Consistency",
        description: "Show up, even when no one’s watching.",
        id: 5,
        image: "https://images.pexels.com/photos/841131/pexels-photo-841131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
    items = DEFAULT_ITEMS,
    baseWidth = 300,
    autoplay = true,
    autoplayDelay = 3000,
    pauseOnHover = false,
    loop = false,
    round = false,
}) {
    const containerPadding = 16;
    const itemWidth = baseWidth - containerPadding * 2;
    const trackItemOffset = itemWidth + GAP;

    const carouselItems = loop ? [...items, items[0]] : items;
    const [currentIndex, setCurrentIndex] = useState(0);
    const x = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const containerRef = useRef(null);
    useEffect(() => {
        if (pauseOnHover && containerRef.current) {
            const container = containerRef.current;
            const handleMouseEnter = () => setIsHovered(true);
            const handleMouseLeave = () => setIsHovered(false);
            container.addEventListener("mouseenter", handleMouseEnter);
            container.addEventListener("mouseleave", handleMouseLeave);
            return () => {
                container.removeEventListener("mouseenter", handleMouseEnter);
                container.removeEventListener("mouseleave", handleMouseLeave);
            };
        }
    }, [pauseOnHover]);

    useEffect(() => {
        if (autoplay && (!pauseOnHover || !isHovered)) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => {
                    if (prev === items.length - 1 && loop) {
                        return prev + 1; // Animate to clone.
                    }
                    if (prev === carouselItems.length - 1) {
                        return loop ? 0 : prev;
                    }
                    return prev + 1;
                });
            }, autoplayDelay);
            return () => clearInterval(timer);
        }
    }, [
        autoplay,
        autoplayDelay,
        isHovered,
        loop,
        items.length,
        carouselItems.length,
        pauseOnHover,
    ]);

    const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

    const handleAnimationComplete = () => {
        if (loop && currentIndex === carouselItems.length - 1) {
            setIsResetting(true);
            x.set(0);
            setCurrentIndex(0);
            setTimeout(() => setIsResetting(false), 50);
        }
    };

    const handleDragEnd = (_, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
            if (loop && currentIndex === items.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
            }
        } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
            if (loop && currentIndex === 0) {
                setCurrentIndex(items.length - 1);
            } else {
                setCurrentIndex((prev) => Math.max(prev - 1, 0));
            }
        }
    };

    const dragProps = loop
        ? {}
        : {
            dragConstraints: {
                left: -trackItemOffset * (carouselItems.length - 1),
                right: 0,
            },
        };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden p-4 ${round
                ? "rounded-full border border-white"
                : "rounded-[24px] border border-[#343333] overflow-hidden"
                }`}
            style={{
                width: "100%",
                maxWidth: `${baseWidth}px`,
                ...(round && { height: `${baseWidth}px` }),
            }}
        >
            <motion.div
                className="flex"
                drag="x"
                {...dragProps}
                style={{
                    width: itemWidth,
                    gap: `${GAP}px`,
                    perspective: 1000,
                    perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
                    x,
                }}
                onDragEnd={handleDragEnd}
                animate={{ x: -(currentIndex * trackItemOffset) }}
                transition={effectiveTransition}
                onAnimationComplete={handleAnimationComplete}
            >
                {carouselItems.map((item, index) => {
                    const range = [
                        -(index + 1) * trackItemOffset,
                        -index * trackItemOffset,
                        -(index - 1) * trackItemOffset,
                    ];
                    const outputRange = [90, 0, -90];
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const rotateY = useTransform(x, range, outputRange, { clamp: false });
                    return (
                        <motion.div
                            key={index}
                            className={`relative shrink-0 flex flex-col ${round
                                ? "items-center justify-center text-center bg-[#060606] border-0"
                                : "items-start justify-between bg-[#222] border border-[#282727] rounded-[12px]"
                                } overflow-hidden cursor-grab active:cursor-grabbing`}
                            style={{
                                width: itemWidth,
                                height: round ? itemWidth : "100%",
                                rotateY: rotateY,
                                ...(round && { borderRadius: "50%" }),
                            }}
                            transition={effectiveTransition}
                        >
                            <div className={`${round ? "p-0 m-0" : "mb-1 p-2"}`}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-[300px] max-w-[500px] h-[120px] md:w-[500px] md:h-[120px] object-cover rounded-t-[12px]"
                                />
                            </div>
                            <div className="p-3">
                                <div className="mb-1 font-black text-lg text-sky-400">
                                    {item.title}
                                </div>
                                <p className="text-sm text-white">{item.description}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
            <div
                className={`flex w-full justify-center ${round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
                    }`}
            >
                <div className="mt-4 flex w-[150px] justify-between px-8">
                    {items.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${currentIndex % items.length === index
                                ? round
                                    ? "bg-white"
                                    : "bg-[#555454]"
                                : round
                                    ? "bg-[#555]"
                                    : "bg-[rgba(93,92,92,0.4)]"
                                }`}
                            animate={{
                                scale: currentIndex % items.length === index ? 1.2 : 1,
                            }}
                            onClick={() => setCurrentIndex(index)}
                            transition={{ duration: 0.15 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
