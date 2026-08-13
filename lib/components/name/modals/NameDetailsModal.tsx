import DefModal from "@/lib/components/common/DefModal";
import OpenDetailButton from "@/lib/components/common/OpenDetailButton";
import NameDetailsContent from "@/lib/components/name/NameDetailsContent";
import type { BaseModalProps, RetiredName, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { StyleSheet, Text } from "react-native";

interface NameDetailsModalProps extends BaseModalProps {
  name: TyphoonName | RetiredName;
  hideReplacedBy?: boolean;
}

const NameDetailsModal = ({ isOpen, onClose, name, hideReplacedBy }: NameDetailsModalProps) => (
  <DefModal
    open={isOpen}
    onClose={onClose}
    title={
      <Text style={[styles.title, { color: getNameStatusColor(name) }]} numberOfLines={1}>
        {name.name}
      </Text>
    }
    // The name's own screen carries the storms it has been used for, which the sheet has no room
    // for. Without this the Names tab was the one place a name led nowhere.
    footer={<OpenDetailButton target={{ kind: "name", name: name.name }} onClose={onClose} />}
  >
    <NameDetailsContent name={name} hideReplacedBy={hideReplacedBy} />
  </DefModal>
);

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
  },
});

export default NameDetailsModal;
