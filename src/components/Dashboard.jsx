import { View } from "react-native";
import {
  TopNavigation,
  Text,
  Layout,
  Divider,
  Icon,
  TopNavigationAction,
  Avatar,
  Button,
} from "@ui-kitten/components";
import gcash from "../../assets/g.png";
import { useState, useContext, useEffect } from "react";

import { ModalDialog } from "./Modal";
import { ListAccessoriesShowcase } from "./EntryList";
import SortBy from "./SortBy";
import Total from "./Total";

import * as SecureStore from "expo-secure-store";

import { ThemeContext } from "../lib/theme-context";
import Balance from "./Balance";
// import { Subscription } from "realm/dist/bundle";
import { CapitalTransactions, GcashTransactions, Capital } from "../lib/realm";
import { useQuery as useRealmQuery } from "@realm/react";

import { useTotalGcashCashBalance } from "../lib/hooks/useTotal";

export default function Dashboard() {
  const [sortBy, setSortBy] = useState("All");
  const [visible, setVisible] = useState(false);
  const [editdata, setEditData] = useState();

  const themeContext = useContext(ThemeContext);
  const gcashSub = useRealmQuery(GcashTransactions);
  const capitalSub = useRealmQuery(CapitalTransactions);
  const addCapitalSub = useRealmQuery(Capital);

  useEffect(() => {
    const createSubscription = async () => {
      await gcashSub.subscribe({
        name: "gcashtransactions",
      });
      await capitalSub.subscribe({
        name: "capitaltransactions",
      });
      await addCapitalSub.subscribe({
        name: "addcapital",
      });
    };

    createSubscription().catch(console.log);
  }, []);

  const gcashrealmdata = gcashSub.sorted("date", true);

  let sortedData = gcashrealmdata.filter((row) => {
    if (sortBy == "All") return true;
    else return row.category == sortBy;
  });

  const gcashBalance = useTotalGcashCashBalance("Gcash");
  const cashBalance = useTotalGcashCashBalance("Cash");
  const balanceMap = [
    { label: "Gcash", balance: gcashBalance },
    { label: "Cash", balance: cashBalance },
  ];

  return (
    <Layout
      style={{
        flex: 1,
        display: "flex",

        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TopNavigation
        title={() => {
          return (
            <View className="flex flex-row items-center justify-center gap-2 p-3">
              <Avatar
                source={gcash}
                size="giant"
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "contain",
                }}
              />
              <Text category="h5">Tracker</Text>
            </View>
          );
        }}
        style={{
          height: 80,
        }}
        accessoryRight={() => (
          <>
            <TopNavigationAction
              icon={(props) => (
                <Icon
                  style={{ backgroundColor: "black" }}
                  name={themeContext.deftheme == "light" ? "sun" : "moon"}
                  {...props}
                />
              )}
              onPress={async () => {
                themeContext.toggleTheme();
                await SecureStore.setItemAsync(
                  "usertheme",
                  themeContext.deftheme == "dark" ? "light" : "dark"
                );
              }}
            />
          </>
        )}
      />

      <View className="h-auto flex w-full flex-row space-x-3 gap-3 items-end justify-evenly pb-3">
        <View className="flex flex-row w-full justify-evenly pb-3">
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              paddingHorizontal: 15,
              marginLeft: 10,
              alignItems: "center",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View style={{ flexDirection: "row", gap: 15 }}>
                {balanceMap.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      category="p1"
                      status="info"
                      style={{
                        margin: "auto",
                        fontWeight: "800",
                        fontSize: 14,
                      }}
                    >
                      {item.label}:
                    </Text>
                    <Balance addTo={item.label} balance={item.balance} />
                  </View>
                ))}
              </View>
              {/* <View>
                <Text
                  category="p1"
                  status="danger"
                  style={{ fontWeight: "bold" }}
                >
                  Transfer
                </Text>
              </View> */}
            </View>

            <Button
              style={{ width: 45, height: 40 }}
              onPress={() => setVisible(true)}
              accessoryLeft={(props) => <Icon {...props} name="plus" />}
              size="small"
              // style={{ height: "100%" }}
            />
          </View>
          <View>
            {editdata && (
              <ModalDialog editdata={editdata} setEditData={setEditData} />
            )}
            {visible && (
              <ModalDialog visible={visible} setVisible={setVisible} />
            )}
          </View>
        </View>
      </View>
      <Divider />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 8,
          gap: 10,
        }}
      >
        <Total
          records={{
            category: "Cash in",
            data: gcashrealmdata.filtered("category == 'Cash in'"),
          }}
        />
        <Total
          records={{
            category: "Cash out",
            data: gcashrealmdata.filtered("category != 'Cash in'"),
          }}
        />
        <SortBy sortBy={sortBy} setSortBy={setSortBy} />
      </View>
      <ListAccessoriesShowcase data={sortedData} setEditData={setEditData} />
    </Layout>
  );
}
