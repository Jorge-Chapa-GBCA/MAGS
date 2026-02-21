import { C } from "../../styles/theme";

export function HazardBar() {
  return (
    <div style={{
      background: `repeating-linear-gradient(45deg, ${C.yellow} 0px, ${C.yellow} 10px, ${C.black} 10px, ${C.black} 20px)`,
      height: 8, width: "100%",
    }} />
  );
}
