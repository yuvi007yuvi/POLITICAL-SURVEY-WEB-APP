import { Switch, Text, TextInput, View } from "react-native";

const baseInputStyle = {
  borderWidth: 1,
  borderColor: "#cbd5e1",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "#ffffff"
};

export const FieldRenderer = ({ field, value, onChange }) => {
  if (field.type === "checkbox") {
    return (
      <View style={{ marginBottom: 16, gap: 8 }}>
        <Text style={{ fontWeight: "600", color: "#0f172a" }}>{field.label}</Text>
        <Switch value={Boolean(value)} onValueChange={onChange} />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16, gap: 8 }}>
      <Text style={{ fontWeight: "600", color: "#0f172a" }}>{field.label}</Text>
      <TextInput
        multiline={field.type === "textarea"}
        keyboardType={field.type === "number" ? "numeric" : "default"}
        placeholder={field.placeholder || `Enter ${field.label}`}
        style={[baseInputStyle, field.type === "textarea" && { minHeight: 110, textAlignVertical: "top" }]}
        value={value ?? ""}
        onChangeText={onChange}
      />
    </View>
  );
};

