import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Button, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { RefreshProps } from "../types/props";
import { Transaction } from "@mysten/sui/transactions"; // Utility yerine Transaction sınıfını ekledik

export function CreateHero({ refreshKey, setRefreshKey }: RefreshProps) {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [power, setPower] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateHero = async () => {
    if (!account || !packageId || !name.trim() || !imageUrl.trim() || !power.trim()) return;
    
    setIsCreating(true);
    
    // --- DEĞİŞİKLİK BURADA BAŞLIYOR ---
    // Utility dosyasını çağırmak yerine işlemi burada (inline) tanımlıyoruz.
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::hero::create_hero`, // Senin Move kodundaki DOĞRU fonksiyon ismi
      arguments: [
        tx.pure.string(name),        // İsim (String)
        tx.pure.string(imageUrl),    // Resim (String)
        tx.pure.u64(Number(power)),  // Güç (u64)
      ],
    });
    // --- DEĞİŞİKLİK BURADA BİTİYOR ---

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async ({ digest }) => {
          await suiClient.waitForTransaction({
            digest,
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          });
          
          // Başarılı olursa formu temizle
          setName("");
          setImageUrl("");
          setPower("");
          setRefreshKey(refreshKey + 1);
          setIsCreating(false);
          alert("Kahraman Başarıyla Oluşturuldu! 🚀"); // Kullanıcıya bilgi ver
        },
        onError: (error) => {
          console.error(error);
          setIsCreating(false);
          alert("Hata oluştu. Lütfen konsolu kontrol et.");
        }
      }
    );
  };

  const isFormValid = name.trim() && imageUrl.trim() && power.trim() && Number(power) > 0;

  if (!account) {
    return (
      <Card>
        <Text>Please connect your wallet to create heroes</Text>
      </Card>
    );
  }

  return (
    <Card style={{ padding: "20px" }}>
      <Flex direction="column" gap="4">
        <Heading size="6">Create New Hero</Heading>
        
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="2">
            <Text size="3" weight="medium">Hero Name</Text>
            <TextField.Root
              placeholder="Enter hero name (e.g., Fire Dragon)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="3" weight="medium">Image URL</Text>
            <TextField.Root
              placeholder="Enter image URL (e.g., https://example.com/hero.jpg)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="3" weight="medium">Power Level</Text>
            <TextField.Root
              placeholder="Enter power level (e.g., 100)"
              type="number"
              min="1"
              value={power}
              onChange={(e) => setPower(e.target.value)}
            />
          </Flex>

          <Button 
            onClick={handleCreateHero}
            disabled={!isFormValid || isCreating}
            size="3"
            loading={isCreating}
            style={{ marginTop: "8px" }}
          >
            {isCreating ? "Creating Hero..." : "Create Hero"}
          </Button>
        </Flex>

        {/* Preview */}
        {name && imageUrl && power && (
          <Card style={{ padding: "16px", background: "var(--gray-a2)" }}>
            <Flex direction="column" gap="2">
              <Text size="3" weight="medium" color="gray">Preview:</Text>
              <Text size="4">{name} (Power: {power})</Text>
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={name}
                  style={{ 
                    width: "120px", 
                    height: "80px", 
                    objectFit: "cover", 
                    borderRadius: "6px" 
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </Flex>
          </Card>
        )}
      </Flex>
    </Card>
  );
}