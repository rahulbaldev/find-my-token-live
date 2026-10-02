import React, { useEffect, useMemo, useState } from "react";

interface RetroTicketProps {
  token: any;
  navigation?: any;
}

const TICKET_ASPECT_RATIO = 1.9;

const getGradientProps = (baseColorName: string) => {
  switch (baseColorName) {
    case "Orange":
      return { start: "#FF7A00", mid: "#FF9500", end: "#FF5E3A" };
    case "Pink":
      return { start: "#FF2A6D", mid: "#FF6584", end: "#D10056" };
    case "Yellow":
      return { start: "#FFD60A", mid: "#FFC300", end: "#FF9F0A" };
    case "Purple":
      return { start: "#9D4EDD", mid: "#7B2CBF", end: "#5A189A" };
    case "Blue":
      return { start: "#4DA3FF", mid: "#1E88E5", end: "#0050CB" };
    case "Coral":
      return { start: "#FF512F", mid: "#F09819", end: "#DD2476" };
    case "Cyan":
      return { start: "#00D2FF", mid: "#0088CC", end: "#005580" };
    default:
      return { start: "#4DA3FF", mid: "#1E88E5", end: "#0050CB" };
  }
};

const getTokenColor = (token: any) => {
  const colors = [
    "Orange",
    "Pink",
    "Yellow",
    "Purple",
    "Blue",
    "Coral",
    "Cyan",
  ];

  if (token?.color) return token.color;

  let hash = 0;
  const str = token?.id || token?.tokenNumber || "default";

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const TicketBackground = ({
  gradient,
}: {
  gradient: { start: string; mid: string; end: string };
}) => {
  const ticketPath = `
    M 15 0
    L 242 0
    A 5 5 0 0 0 252 0
    L 365 0
    A 15 15 0 0 1 380 15
    L 380 45
    A 5 5 0 0 0 380 55
    L 380 85
    A 15 15 0 0 0 380 115
    L 380 145
    A 5 5 0 0 0 380 155
    L 380 185
    A 15 15 0 0 1 365 200
    L 252 200
    A 5 5 0 0 0 242 200
    L 15 200
    A 15 15 0 0 1 0 185
    L 0 165
    A 5 5 0 0 0 0 155
    L 0 150
    A 5 5 0 0 0 0 140
    L 0 120
    A 20 20 0 0 0 0 80
    L 0 60
    A 5 5 0 0 0 0 50
    L 0 45
    A 5 5 0 0 0 0 35
    L 0 15
    A 15 15 0 0 1 15 0
    Z
  `;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 380 200"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <defs>
        <linearGradient
          id="ticketGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={gradient.start} />
          <stop offset="50%" stopColor={gradient.mid} />
          <stop offset="100%" stopColor={gradient.end} />
        </linearGradient>

        <linearGradient
          id="overlayGradient"
          x1="20%"
          y1="0%"
          x2="80%"
          y2="100%"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="black" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <path d={ticketPath} fill="url(#ticketGradient)" />
      <path d={ticketPath} fill="url(#overlayGradient)" />

      <line
        x1="247"
        y1="12"
        x2="247"
        y2="188"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
    </svg>
  );
};

const RetroTicket: React.FC<RetroTicketProps> = ({ token, navigation }) => {
  const [reminderTime, setReminderTime] = useState<Date | null>(
    token?.reminderTime ? new Date(token.reminderTime) : null
  );

  const tokenColorName = useMemo(
    () => getTokenColor(token),
    [token]
  );

  const gradient = useMemo(
    () => getGradientProps(tokenColorName),
    [tokenColorName]
  );

  useEffect(() => {
    setReminderTime(
      token?.reminderTime ? new Date(token.reminderTime) : null
    );
  }, [token]);

  const salon = token?.salon || token?.business || null;

  const queuePosition =
    token?.queuePosition ??
    token?.position ??
    1;

  const waitingTime =
    token?.waitingTime ??
    token?.estimatedWait ??
    queuePosition * 15;

  const customerName =
    token?.customerName ||
    token?.name ||
    "Rahul";

  const tokenNumber =
    token?.tokenNumber ||
    token?.token ||
    "RF-27";

  const service =
    token?.serviceName ||
    token?.service ||
    "Haircut & Styling";

  const status =
    token?.status?.toUpperCase() ||
    "ACTIVE";

  const salonName =
    salon?.name ||
    salon?.business_name ||
    "Luxury Salon";

  const salonAddress =
    salon?.address ||
    "Your salon";

  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate("Home");
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this token?"
      );

      if (confirmed) {
        window.dispatchEvent(
          new CustomEvent("find-my-token:cancel-token", {
            detail: token,
          })
        );
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={handleBack}
          style={styles.iconButton}
          aria-label="Go back"
        >
          ←
        </button>

        <div style={styles.headerTitle}>Token Details</div>

        <button
          type="button"
          onClick={() => {}}
          style={styles.iconButton}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>

      <div style={styles.scrollContent}>
        <div style={styles.ticketContainer}>
          <TicketBackground gradient={gradient} />

          <div style={styles.ticketContent}>
            <div style={styles.ticketMain}>
              <div style={styles.topBranding}>
                <div style={styles.ticketIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M22 10V6c0-1.11-.89-2-2-2H4c-1.11 0-2 .89-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM4 6h16v2.67c-1.25.43-2 1.6-2 2.83s.75 2.4 2 2.83V18H4v-2.67c1.25-.43 2-1.6-2-2.83V6z" />
                  </svg>
                </div>

                <span style={styles.brandingText}>
                  Find My Token
                </span>
              </div>

              <div style={styles.tokenDataContainer}>
                <div style={styles.yourTokenLabel}>
                  YOUR TOKEN
                </div>

                <div style={styles.customerNameContainer}>
                  <span style={styles.customerIcon}>●</span>

                  <span style={styles.customerNameText}>
                    {customerName}
                  </span>
                </div>

                <div style={styles.tokenNumber}>
                  {tokenNumber}
                </div>
              </div>
            </div>

            <div style={styles.ticketStub}>
              <div style={styles.statusPill}>
                <span style={styles.statusCircle} />
                <span style={styles.statusText}>
                  {status}
                </span>
              </div>

              <div style={styles.stubDetails}>
                <div style={styles.clockIconContainer}>
                  <span style={styles.clockIcon}>◷</span>
                </div>

                <div style={styles.stubWaitText}>
                  PLEASE WAIT
                  <br />
                  FOR YOUR TURN
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.salonName}>
            {salonName}
          </div>

          <div style={styles.salonAddress}>
            {salonAddress}
          </div>

          <div style={styles.metricsContainer}>
            <div style={styles.metricCard}>
              <div style={styles.metricValue}>
                {queuePosition}
              </div>

              <div style={styles.metricLabel}>
                Position
              </div>
            </div>

            <div style={styles.metricCard}>
              <div style={styles.metricValue}>
                {waitingTime} min
              </div>

              <div style={styles.metricLabel}>
                Est. Wait
              </div>
            </div>
          </div>

          <div style={styles.actionsList}>
            <div style={styles.actionItem}>
              <div style={styles.actionIconContainer}>
                ✂
              </div>

              <div>
                <div style={styles.actionTitle}>
                  Service
                </div>

                <div style={styles.actionDetail}>
                  {service}
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.actionItem,
                borderBottom: "none",
              }}
            >
              <div style={styles.actionIconContainer}>
                🔔
              </div>

              <div>
                <div style={styles.actionTitle}>
                  Reminder
                </div>

                <div style={styles.actionDetail}>
                  {reminderTime
                    ? `At ${reminderTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Not set"}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
          >
            Cancel Token
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#11111E",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "1px solid #2A2A40",
    boxSizing: "border-box",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
  },

  iconButton: {
    width: 40,
    height: 40,
    border: "none",
    background: "transparent",
    color: "white",
    fontSize: 25,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    width: "100%",
    maxWidth: 720,
    margin: "0 auto",
    paddingBottom: 40,
    boxSizing: "border-box",
  },

  ticketContainer: {
    width: "92%",
    margin: "25px auto 20px",
    aspectRatio: String(TICKET_ASPECT_RATIO),
    position: "relative",
    overflow: "hidden",
    filter:
      "drop-shadow(0 8px 10px rgba(0,0,0,0.4))",
  },

  ticketContent: {
    position: "absolute",
    inset: 0,
    display: "flex",
  },

  ticketMain: {
    flex: 0.65,
    minWidth: 0,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },

  topBranding: {
    display: "flex",
    alignItems: "center",
  },

  ticketIcon: {
    marginRight: 6,
    opacity: 0.85,
    display: "flex",
  },

  brandingText: {
    color: "white",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.3,
  },

  tokenDataContainer: {
    marginBottom: 2,
  },

  yourTokenLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  customerNameContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: 4,
    minWidth: 0,
  },

  customerIcon: {
    marginRight: 5,
    fontSize: 10,
    opacity: 0.9,
  },

  customerNameText: {
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    opacity: 0.95,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tokenNumber: {
    color: "white",
    fontSize: "clamp(42px, 10vw, 76px)",
    fontWeight: 900,
    letterSpacing: -1.5,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  ticketStub: {
    flex: 0.35,
    minWidth: 0,
    padding: "18px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },

  statusPill: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: "6px 12px",
    borderRadius: 20,
    marginTop: 5,
    maxWidth: "100%",
    boxSizing: "border-box",
  },

  statusCircle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.9)",
    marginRight: 6,
    flexShrink: 0,
  },

  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.8,
    whiteSpace: "nowrap",
  },

  stubDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },

  clockIconContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  clockIcon: {
    color: "white",
    fontSize: 25,
    lineHeight: 1,
  },

  stubWaitText: {
    color: "white",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 14,
    opacity: 0.9,
  },

  infoSection: {
    padding: "0 20px",
    marginTop: 10,
  },

  salonName: {
    color: "white",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 3,
  },

  salonAddress: {
    color: "#888899",
    fontSize: 14,
    marginBottom: 20,
  },

  metricsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  metricCard: {
    backgroundColor: "#1A1A2E",
    flex: 1,
    padding: 15,
    borderRadius: 12,
    textAlign: "center",
    boxSizing: "border-box",
  },

  metricValue: {
    color: "white",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "center",
  },

  metricLabel: {
    color: "#888899",
    fontSize: 12,
    textAlign: "center",
  },

  actionsList: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: "0 10px",
    marginBottom: 20,
  },

  actionItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #2A2A40",
  },

  actionIconContainer: {
    backgroundColor: "#2A2A40",
    width: 40,
    height: 40,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    flexShrink: 0,
  },

  actionTitle: {
    color: "#888899",
    fontSize: 12,
  },

  actionDetail: {
    color: "white",
    fontSize: 15,
    fontWeight: 500,
  },

  cancelButton: {
    width: "100%",
    border: "none",
    backgroundColor: "#c62828",
    color: "white",
    padding: "15px 20px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default RetroTicket;
