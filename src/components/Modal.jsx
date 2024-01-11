import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Modal,
  Text,
  Input,
  Icon,
  Datepicker,
  Select,
  SelectItem,
  OverflowMenu,
  MenuItem,
  Divider,
} from "@ui-kitten/components";
import { Alert } from "react-native";
import { editRecord, insertRecord } from "../lib/sqlite";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format, toDate } from "date-fns";

export const ModalDialog = ({ visible, setVisible, editdata, setEditData }) => {
  let today = new Date();
  console.log(editdata);
  const [date, setDate] = React.useState(today);
  const [data, setData] = React.useState(
    editdata ?? {
      date: format(new Date(), "MMM dd, yyyy"),
    }
  );
  const [fee, setFee] = React.useState(editdata ? editdata.fee : 0);
  const [loadOptions, setLoadOptions] = React.useState(false);

  const queryClient = useQueryClient();

  const checkValues = (data) => {
    if (
      !data.description ||
      !data.amount ||
      !data.date ||
      !data.category ||
      !data.fee
    ) {
      Alert.alert(
        "Please fill all the fields",
        "Some required fields are empty"
      );

      return;
    }

    mutation.mutate(editdata ? { id: editdata?.id, ...data } : data);
  };

  const mutation = useMutation({
    mutationFn: !editdata ? insertRecord : editRecord,
    onSuccess: (data, variables) => {
      unset();

      queryClient.setQueryData(
        ["fetchrecords"],
        !editdata
          ? (oldData) => [
              ...oldData,
              {
                ...variables,
                id: data,
                category:
                  variables?.category == "Load"
                    ? `${variables.category}   (${variables.load})`
                    : variables.category,
              },
            ]
          : (oldData) => {
              console.log("variables", variables);
              return oldData.map((item) => {
                if (item.id == variables.id) {
                  return {
                    ...item,
                    ...variables,
                    category:
                      variables?.category == "Load"
                        ? `${variables.category}   (${variables.load})`
                        : variables?.category,
                  };
                }
                return item;
              });
            }
      );
      setData({ date: format(new Date(), "MMM dd, yyyy") });
      setDate(today);
    },
    onError: (error, variables) => {
      Alert.alert("Error", error.message);
    },
  });

  const selectoptions = ["Cash in", "Cash out", "Load", "Others"];
  const unset = () => {
    visible ? setVisible(false) : null;
    setDate(today);
    setData({ date: format(today, "MMM dd, yyyy") });
    setFee(0);
    editdata ? setEditData() : null;
  };

  const defaultData = (property) => {
    if (property == "date") {
      return editdata ? new Date(editdata[property]) : today;
    }

    return editdata ? editdata[property] : "";
  };
  const calculateFee = (data) => {
    let computedfee = 0;
    if (
      (data.category == "Cash in" || data.category == "Cash out") &&
      +data.amount
    ) {
      let per250 = Math.floor(+data.amount / 250);
      +data.amount % 250 != 0 ? per250++ : per250;

      computedfee = per250 * 5;
      setFee(computedfee);
    } else if (data.category == "Load" && +data.amount) {
      if (data.load == "Globe") {
        computedfee = 3;
        setFee(computedfee);
      } else if (data.load == "Other") {
        computedfee = +data.amount * 0.02 + 3;
        setFee(computedfee);
      }
    } else {
      setFee(0);
      computedfee = 0;
    }
    return computedfee;
  };

  return (
    <View className=" h-10">
      <Modal
        style={{ flex: 1 }}
        visible={editdata ? true : visible ? true : false}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => {
          unset();
        }}
      >
        <Card
          disabled={true}
          style={{
            flex: 1,
            width: 300,
            rowGap: 20,
            padding: 5,
            borderRadius: 10,
          }}
          header={() => (
            <View className="flex item-center justify-center px-5 h-6">
              <Text category="h5">
                {`${
                  selectoptions[data.index] ??
                  editdata?.category ??
                  "New Record"
                }`}
              </Text>
            </View>
          )}
          footer={() => (
            <View className="flex flex-row justify-center items-center gap-12 p-3 h-[120px]">
              <Button
                appearance="outline"
                onPress={() => {
                  unset();
                }}
              >
                CANCEL
              </Button>
              <Button style={{ width: 100 }} onPress={() => checkValues(data)}>
                {editdata ? "EDIT" : "SAVE"}
              </Button>
            </View>
          )}
        >
          <View className="h-auto space-y-3 ">
            <View style={{ rowGap: 20 }}>
              <Input
                style={{
                  flex: 1,
                  height: 50,
                  borderColor: "black",
                  borderWidth: 1,
                }}
                defaultValue={defaultData("description")}
                placeholder="Enter details"
                label="Description"
                multiline={true}
                accessoryRight={(props) => {
                  return (
                    <Icon {...props} name="list">
                      Today
                    </Icon>
                  );
                }}
                onChangeText={(nextValue) =>
                  setData((prev) => ({ ...prev, description: nextValue }))
                }
              />

              <Datepicker
                date={date}
                onSelect={(nextDate) => {
                  setDate(nextDate),
                    setData((prev) => ({
                      ...prev,
                      date: format(nextDate, "MMM dd, yyyy"),
                    }));
                }}
                accessoryRight={(props) => {
                  return (
                    <Icon {...props} name="calendar">
                      Today
                    </Icon>
                  );
                }}
                placeholder={"Pick Date"}
                label="Date"
                placement="right end"
                backdropStyle={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: 5,
                }}
              />
              <View className="flex flex-row gap-3">
                <Input
                  style={{
                    flex: 1,
                    height: 50,
                    borderColor: "black",
                    borderWidth: 1,
                  }}
                  defaultValue={defaultData("amount").toString()}
                  placeholder="Enter amount"
                  label="Amount"
                  keyboardType="numeric"
                  onChangeText={(nextValue) => {
                    setData((prev) => ({
                      ...prev,
                      amount: nextValue,
                    }));

                    setData((prev) => ({
                      ...prev,
                      fee: calculateFee(prev),
                    }));
                  }}
                  // accessoryRight={(props) => (
                  //   <Icon name="money" {...props} pack="fontawesome" />
                  // )}
                />
                <Input
                  style={{
                    width: 75,
                  }}
                  defaultValue={
                    fee.toString() ?? editdata?.fee.toString() ?? null
                  }
                  placeholder="Fee"
                  label={"Fee"}
                  maxLength={5}
                  keyboardType="numeric"
                  onChangeText={(nextValue) =>
                    setData((prev) => ({ ...prev, fee: nextValue }))
                  }
                />
              </View>

              <Select
                placeholder={
                  editdata?.category == "Load"
                    ? `${editdata?.category + `   (${editdata?.load})`}`
                    : "Select category"
                }
                label="Type"
                value={
                  data.category == "Load"
                    ? `${data.category}   (${data.load})`
                    : selectoptions[data.index]
                }
                onSelect={(index) => {
                  setData((prev) => ({
                    ...prev,
                    index: index.section,
                    category: selectoptions[index.section],
                    fee: calculateFee({
                      category: selectoptions[index.section],
                      amount: prev.amount,
                    }),
                  }));
                }}
              >
                {selectoptions.map((item, index) => {
                  if (item == "Load") {
                    return (
                      <OverflowMenu
                        onSelect={(sel) => {
                          let newdata = {};
                          if (sel.row == 0) {
                            newdata = {
                              index: 2,
                              category: "Load",
                              load: "Globe",
                            };
                          } else {
                            newdata = {
                              index: 2,
                              category: "Load",
                              load: "Other",
                            };
                          }
                          setData((prev) => ({
                            ...prev,
                            ...newdata,
                          }));
                          setData((prev) => ({
                            ...prev,
                            fee: calculateFee(prev),
                          }));
                          setLoadOptions(false);
                        }}
                        style={{ width: 120, zIndex: 1000 }}
                        key={index}
                        visible={loadOptions}
                        placement={"right"}
                        anchor={() => (
                          <View style={{ width: 140 }} key={index}>
                            <SelectItem
                              title={item}
                              key={index}
                              onPress={() => {
                                setLoadOptions(true);
                              }}
                            />
                            <Divider />
                          </View>
                        )}
                        onBackdropPress={() => {
                          setLoadOptions(false);
                        }}
                      >
                        <MenuItem title="Globe" />
                        <Divider />
                        <MenuItem title="Other" />
                      </OverflowMenu>
                    );
                  }
                  return (
                    <View key={index}>
                      <SelectItem title={item} key={index} />
                      <Divider />
                    </View>
                  );
                })}
              </Select>
            </View>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    padding: 16,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
