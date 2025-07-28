
import { Card, CardContent } from "@/components/ui/card";

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3">Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
      </CardContent>
    </Card>
  );
};
