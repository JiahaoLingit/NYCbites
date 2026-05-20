import { Location, Activity, PriceRange } from "@/../global_types";
import { convertMilitaryToStandardTime } from '@/app/utils/activityUtils';
import haversineDistance from "haversine-distance";
import Link from "next/link";

export function ActivityCard({ activity, userLocation, onClick }: { activity: Activity, userLocation: Location, onClick?: () => void }) {
    const miles = getMilesFromUser(activity.location, userLocation);
    const isOpen = !!activity.currentOpening;
    const isClosed = !isOpen && !!activity.nextOpening;

    return (
        <div
            onClick={onClick}
            style={{
                background: "white",
                borderRadius: "14px",
                border: "0.5px solid #e5e7eb",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                width: "100%",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            {}
            <div style={{
                width: "100%", height: "130px",
                background: getBannerGradient(activity.types),
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "42px",
                overflow: "hidden",
            }}>
                {activity.photosUri ? (
                    <img
                        src={activity.photosUri}
                        alt={activity.activityName}
                        style={{
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                        }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                ) : (
                    getCuisineEmoji(activity.types)
                )}

                {}
                <span style={{
                    position: "absolute", top: "10px", left: "10px",
                    background: "rgba(0,0,0,0.50)",
                    color: "white", fontSize: "11px", fontWeight: 500,
                    padding: "3px 9px", borderRadius: "20px",
                }}>
                    {miles} mi
                </span>

                {}
                {isOpen && (
                    <span style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: "#14532d", color: "#bbf7d0",
                        fontSize: "10px", fontWeight: 500,
                        padding: "3px 9px", borderRadius: "20px",
                    }}>Open now</span>
                )}
                {isClosed && (
                    <span style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: "#450a0a", color: "#fca5a5",
                        fontSize: "10px", fontWeight: 500,
                        padding: "3px 9px", borderRadius: "20px",
                    }}>Closed</span>
                )}
                {!activity.openHours && (
                    <span style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: "#14532d", color: "#bbf7d0",
                        fontSize: "10px", fontWeight: 500,
                        padding: "3px 9px", borderRadius: "20px",
                    }}>Open 24/7</span>
                )}
            </div>

            {}
            <div style={{ padding: "12px 14px 10px" }}>

                {}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827", lineHeight: 1.25 }}>
                        {activity.activityName}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#6b7280", flexShrink: 0 }}>
                        {getPriceLabel(activity.priceLevel, activity.priceRange)}
                    </span>
                </div>

                {}
                {activity.rating && activity.ratingsCount && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
                        <StarRow rating={activity.rating} />
                        <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{activity.rating.toFixed(1)}</span>
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>({activity.ratingsCount.toLocaleString()})</span>
                    </div>
                )}

                {}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "9px" }}>
                    <span style={{
                        fontSize: "11px", fontWeight: 500,
                        padding: "3px 9px", borderRadius: "20px",
                        background: "#fff7ed", color: "#c2410c", border: "0.5px solid #fed7aa",
                    }}>
                        {getCuisineEmoji(activity.types)} {getCuisineLabel(activity.types)}
                    </span>
                    {activity.types.slice(0, 2).map(t => (
                        <span key={t} style={{
                            fontSize: "11px", fontWeight: 500,
                            padding: "3px 9px", borderRadius: "20px",
                            background: "#f3f4f6", color: "#6b7280", border: "0.5px solid #e5e7eb",
                        }}>
                            {formatType(t)}
                        </span>
                    ))}
                </div>

                {}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    marginTop: "10px", paddingTop: "9px",
                    borderTop: "0.5px solid #f3f4f6",
                    fontSize: "11px", color: "#6b7280",
                }}>
                    <span>🕐 {activity.currentOpening
                        ? `Until ${convertMilitaryToStandardTime(activity.currentOpening.closing.time)}`
                        : activity.nextOpening
                        ? `Opens ${convertMilitaryToStandardTime(activity.nextOpening.opening.time)}`
                        : "Open 24/7"
                    }</span>
                    <span>📍 {activity.address.split(",")[0]}</span>
                </div>

                {}
                <div style={{ display: "flex", gap: "6px", marginTop: "9px" }}>
                    {activity.reviewsUri && (
                        <a href={activity.reviewsUri} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={linkStyle}>Reviews</a>
                    )}
                    {activity.websiteUri && (
                        <a href={activity.websiteUri} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={linkStyle}>Website</a>
                    )}
                    {activity.directionsUri && (
                        <a href={activity.directionsUri} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ ...linkStyle, background: "#ea580c", color: "white", border: "none" }}>
                            Directions
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

const linkStyle: React.CSSProperties = {
    flex: 1, padding: "6px 0", borderRadius: "7px",
    textAlign: "center", fontSize: "11px", fontWeight: 500,
    border: "0.5px solid #d1d5db", color: "#374151",
    background: "white", textDecoration: "none", display: "block",
};

function StarRow({ rating }: { rating: number }) {
    const full = Math.floor(rating);
    const half = Math.round(rating - full) === 1;
    const empty = 5 - full - (half ? 1 : 0);
    const star = (key: string, fill: string) => (
        <svg key={key} width="12" height="12" viewBox="0 0 24 24" fill={fill} style={{ display: "inline" }}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
    );
    return (
        <span style={{ display: "flex", gap: "1px" }}>
            {[...Array(full)].map((_, i) => star(`f${i}`, "#f59e0b"))}
            {half && star("h", "#f59e0b")}
            {[...Array(empty)].map((_, i) => star(`e${i}`, "#d1d5db"))}
        </span>
    );
}

function getPriceLabel(level?: number, range?: PriceRange): string {
    if (range) return `$${range.startPrice}${range.endPrice ? `–${range.endPrice}` : "+"}`;
    switch (level) {
        case 1: return "Free";
        case 2: return "$";
        case 3: return "$$";
        case 4: case 5: return "$$$";
        default: return "";
    }
}

function getCuisineEmoji(types: string[]): string {
    const t = types.join(" ");
    if (t.includes("italian")) return "🍕";
    if (t.includes("japanese") || t.includes("sushi")) return "🍣";
    if (t.includes("mexican")) return "🌮";
    if (t.includes("chinese")) return "🍜";
    if (t.includes("indian")) return "🍛";
    if (t.includes("thai")) return "🍲";
    if (t.includes("greek")) return "🥙";
    if (t.includes("french")) return "🥐";
    if (t.includes("korean")) return "🍖";
    if (t.includes("american") || t.includes("burger")) return "🍔";
    if (t.includes("pizza")) return "🍕";
    if (t.includes("seafood")) return "🦞";
    if (t.includes("coffee") || t.includes("cafe")) return "☕";
    if (t.includes("bar") || t.includes("pub")) return "🍺";
    return "🍽️";
}

function getCuisineLabel(types: string[]): string {
    const t = types.join(" ");
    if (t.includes("italian")) return "Italian";
    if (t.includes("japanese") || t.includes("sushi")) return "Japanese";
    if (t.includes("mexican")) return "Mexican";
    if (t.includes("chinese")) return "Chinese";
    if (t.includes("indian")) return "Indian";
    if (t.includes("thai")) return "Thai";
    if (t.includes("greek")) return "Greek";
    if (t.includes("french")) return "French";
    if (t.includes("korean")) return "Korean";
    if (t.includes("american")) return "American";
    if (t.includes("pizza")) return "Pizza";
    if (t.includes("seafood")) return "Seafood";
    if (t.includes("coffee") || t.includes("cafe")) return "Café";
    if (t.includes("bar") || t.includes("pub")) return "Bar";
    return "Restaurant";
}

function getBannerGradient(types: string[]): string {
    const t = types.join(" ");
    if (t.includes("italian") || t.includes("pizza")) return "linear-gradient(135deg, #7c2d12, #c2410c)";
    if (t.includes("japanese") || t.includes("sushi")) return "linear-gradient(135deg, #1e3a5f, #2563eb)";
    if (t.includes("mexican")) return "linear-gradient(135deg, #713f12, #ca8a04)";
    if (t.includes("chinese")) return "linear-gradient(135deg, #7f1d1d, #dc2626)";
    if (t.includes("indian")) return "linear-gradient(135deg, #78350f, #d97706)";
    if (t.includes("thai")) return "linear-gradient(135deg, #14532d, #16a34a)";
    if (t.includes("korean")) return "linear-gradient(135deg, #4c1d95, #7c3aed)";
    if (t.includes("coffee") || t.includes("cafe")) return "linear-gradient(135deg, #292524, #78716c)";
    if (t.includes("bar") || t.includes("pub")) return "linear-gradient(135deg, #1c1917, #44403c)";
    return "linear-gradient(135deg, #1f2937, #4b5563)";
}

function formatType(type: string): string {
    return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getMilesFromUser(activityLocation: Location, userLocation: Location): string {
    const meters = haversineDistance(activityLocation, userLocation);
    return (meters / 1609.347).toFixed(1);
}
