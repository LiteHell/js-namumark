import colorNames from "colornames";
export default function GetColorHex(hexOrColorname: string): string | null {
  const color = colorNames.get(
    hexOrColorname.startsWith("#")
      ? hexOrColorname.substring(1)
      : hexOrColorname
  );
  if (color) {
    return color.value.toUpperCase();
  } else {
    return /#([a-zA-Z0-9]{3}){1,2}/.test(hexOrColorname)
      ? hexOrColorname.toUpperCase()
      : null;
  }
}
