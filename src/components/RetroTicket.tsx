import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import Svg, { Path, Rect, LinearGradient, Stop, Defs, Line } from "react-native-svg";
import { Ionicons, Feather, MaterialIcons, Entypo } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import useQueueStore from "../store/queueStore";
import TokenModal from "../components/TokenModal";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import SalonDetailsModal from "../components/SalonDetailsModal";

// Constants for layout
const TICKET_ASPECT_RATIO = 1.9; // 380/200 physical proportion
const TICKET_SVG_WIDTH = 380;
const TICKET_SVG_HEIGHT = 200;
const STUB_RATIO = 0.65; // Matches the physical perforation line location

// Advanced multi-stop gradients for a premium printed look
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
      return { start: "#4da3ff", mid: "#1e88e5", end: "#0050CB" };
    case "Coral":
      return { start: "#FF512F", mid: "#F09819", end: "#DD2476" };
    case "Cyan":
      return { start: "#00D2FF", mid: "#0088CC", end: "#005580" };
    default: // Default Blue
      return { start: "#4da3ff", mid: "#1e88e5", end: "#0050CB" };
  }
};

// Properly calculate deterministic colour without relying on string length
const getTokenColor = (token: any) => {
  const colors = ['Orange', 'Pink', 'Yellow', 'Purple', 'Blue', 'Coral', 'Cyan'];
  if (token.color) return token.color; 
  
  let hash = 0;
  const str = token.id || token.tokenNumber || "default";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const PhysicalTicketShape: React.FC<{ colorProps: any, width: number }> = ({ colorProps, width }) => {
  const height = width / TICKET_ASPECT_RATIO;
  
  // A highly accurate physical ticket boundary with rounded corners and repeated inward notches
  const ticketPath = `
    M 15 0
    L 242 0 A 5 5 0 0 0 252 0 L 365 0
    A 15 15 0 0 1 380 15
    L 380 45 A 5 5 0 0 0 380 55
    L 380 85 A 15 15 0 0 0 380 115
    L 380 145 A 5 5 0 0 0 380 155
    L 380 185
    A 15 15 0 0 1 365 200
    L 252 200 A 5 5 0 0 0 242 200 L 15 200
    A 15 15 0 0 1 0 185
    L 0 165 A 5 5 0 0 0 0 155
    L 0 150 A 5 5 0 0 0 0 140
    L 0 120 A 20 20 0 0 0 0 80
    L 0 60 A 5 5 0 0 0 0 50
    L 0 45 A 5 5 0 0 0 0 35
    L 0 15
    A 15 15 0 0 1 15 0
    Z
  `;

  return (
    <View style={{ width: width, height: height, position: 'absolute' }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${TICKET_SVG_WIDTH} ${TICKET_SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Main Diagonal Background Gradient */}
          <LinearGradient id="ticketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorProps.start} stopOpacity="1" />
            <Stop offset="50%" stopColor={colorProps.mid} stopOpacity="1" />
            <Stop offset="100%" stopColor={colorProps.end} stopOpacity="1" />
          </LinearGradient>
          
          {/* Dimensional Light/Dark Overlay for physical depth */}
          <LinearGradient id="overlayGradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="black" stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Base Colored Ticket Shape */}
        <Path d={ticketPath} fill="url(#ticketGradient)" />

        {/* Tonal Overlay applied perfectly to the exact same shape */}
        <Path d={ticketPath} fill="url(#overlayGradient)" />

        {/* Integrated Physical Perforation Line */}
        <Line 
          x1="247" y1="12" 
          x2="247" y2="188" 
          stroke="rgba(255,255,255,0.45)" 
          strokeWidth="2" 
          strokeDasharray="6 6" 
        />
      </Svg>
    </View>
  );
};

interface RetroTicketProps {
  token: any;
  navigation: any;
}

const RetroTicket: React.FC<RetroTicketProps> = ({ token, navigation }) => {
  // --- EXISTING FUNCTIONALITY / STATE (RETAINED) ---
  const { salons, removeToken, updateToken } = useQueueStore();
  const [ticketWidth, setTicketWidth] = useState(0);

  const salon = useMemo(() => {
    return salons.find((s) => s.id === token.salonId);
  }, [salons, token.salonId]);

  const queuePosition = useMemo(() => {
    if (!salon || !salon.queue) return { position: 0, waitingTime: 0 };
    const index = salon.queue.findIndex((t) => t.id === token.id);
    return { position: index + 1, waitingTime: (index + 1) * 15 }; 
  }, [salon, token]);

  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(token.reminderTime ? new Date(token.reminderTime) : null);
  const [tokenColorName, setTokenColorName] = useState('Blue');

  useEffect(() => {
    // Utilize safe automatic rotation based on content, not string length
    setTokenColorName(getTokenColor(token));

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status);
    })();
  }, [token]);

  const colorProps = getGradientProps(tokenColorName);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      {/* Header section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Token Details</Text>
        <TouchableOpacity onPress={() => {}}>
          <Entypo name="dots-three-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PHYSICAL TICKET VIEW */}
        <View style={styles.ticketContainer} onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setTicketWidth(width);
        }}>
          {/* SVG Background Layer */}
          <PhysicalTicketShape colorProps={colorProps} width={ticketWidth} />

          {/* Ticket Content Overlay (Flexed to match physical perforation ratio ~65/35) */}
          <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.ticketContent}>
              
              {/* MAIN SECTION (LEFT) */}
              <View style={styles.ticketMain}>
                {/* Top Branding - Shown ONLY once at the top */}
                <View style={styles.topBranding}>
                  <View style={styles.ticketIconContainer}>
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <Path d="M22 10V6c0-1.11-.89-2-2-2H4c-1.11 0-2 .89-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM4 6h16v2.67c-1.25.43-2 1.6-2 2.83s.75 2.4 2 2.83V18H4v-2.67c1.25-.43 2-1.6 2-2.83s-.75-2.4-2-2.83V6z" />
                    </Svg>
                  </View>
                  <Text style={styles.brandingText}>Find My Token</Text>
                </View>

                {/* Exact Requested Hierarchy */}
                <View style={styles.tokenDataContainer}>
                  <Text style={styles.yourTokenLabel}>YOUR TOKEN</Text>
                  
                  <View style={styles.customerNameContainer}>
                    <Ionicons name="person" size={13} color="white" style={styles.customerIcon} />
                    <Text style={styles.customerNameText} numberOfLines={1}>
                      {token.customerName || "Rahul"}
                    </Text>
                  </View>

                  <Text style={styles.tokenNumber} adjustsFontSizeToFit numberOfLines={1}>
                    {token.tokenNumber || "RF-27"}
                  </Text>
                </View>
              </View>

              {/* STUB SECTION (RIGHT) */}
              <View style={styles.ticketStub}>
                {/* Status Pill (Zero Green - High Contrast Neutral) */}
                <View style={styles.statusPill}>
                  <View style={styles.statusCircle} />
                  <Text style={styles.statusText}>{token.status ? token.status.toUpperCase() : "ACTIVE"}</Text>
                </View>

                <View style={styles.stubDetails}>
                  <View style={styles.clockIconContainer}>
                     <Feather name="clock" size={20} color="white" />
                  </View>
                  <Text style={styles.stubWaitText}>PLEASE WAIT{"\n"}FOR YOUR TURN</Text>
                </View>
              </View>
              
            </View>
          </View>
        </View>

        {/* --- BELOW-TICKET CONTENT (UNCHANGED) --- */}
        <View style={styles.infoSection}>
          <Text style={styles.salonName}>{salon ? salon.name : "Luxury Salon"}</Text>
          <Text style={styles.salonAddress}>{salon ? salon.address : "123 Main St, Springfield"}</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{queuePosition.position}</Text>
              <Text style={styles.metricLabel}>Position</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{queuePosition.waitingTime} min</Text>
              <Text style={styles.metricLabel}>Est. Wait</Text>
            </View>
          </View>

          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <MaterialIcons name="local-offer" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Service</Text>
                <Text style={styles.actionDetail}>{token.service || "Haircut & Styling"}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Feather name="bell" size={20} color="#4A90E2" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Reminder</Text>
                <Text style={styles.actionDetail}>{reminderTime ? `At ${reminderTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Not set"}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel Token</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#11111E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A40",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // NEW TICKET LAYOUT
  ticketContainer: {
    width: "92%",
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 20,
    aspectRatio: TICKET_ASPECT_RATIO,
    // Refined premium shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
    position: 'relative',
    overflow: 'visible',
  },
  ticketContent: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Left side mapped dynamically to the perforation split (.65 / .35)
  ticketMain: {
    flex: 0.65,
    paddingHorizontal: 22,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  topBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketIconContainer: {
    marginRight: 6,
    opacity: 0.85,
  },
  brandingText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tokenDataContainer: {
    marginBottom: 2, // Fine-tuned vertical alignment
  },
  yourTokenLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  customerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerIcon: {
    marginRight: 5,
    opacity: 0.9,
  },
  customerNameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.95,
  },
  tokenNumber: {
    color: 'white',
    fontSize: 76,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginLeft: -3, 
    lineHeight: 85, 
  },

  // Right Side (Detachable Stub)
  ticketStub: {
    flex: 0.35,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Clean, dark, non-green treatment
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  statusCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // High-contrast neutral
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stubDetails: {
    alignItems: 'center',
    marginBottom: 10,
  },
  clockIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stubWaitText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.9,
  },

  // BELOW-TICKET CONTENT
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  salonName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 3,
  },
  salonAddress: {
    color: "#888899",
    fontSize: 14,
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#1A1A2E",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  metricValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    color: "#888899",
    fontSize: 12,
  },
  actionsList: {
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A40",
  },
  actionIconContainer: {
    backgroundColor: "#2A2A40",
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  actionTitle: {
    color: "#888899",
    fontSize: 12,
  },
  actionDetail: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#c62828", 
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RetroTicket;
                                                             
