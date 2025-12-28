'use client';

import { Card, Checkbox, Button, Typography } from "@material-tailwind/react";
import { FEATURES, type FeatureType } from '@/lib/textProcessor';

interface FeatureTogglesProps {
  enabledFeatures: Set<FeatureType>;
  onToggle: (featureId: FeatureType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function FeatureToggles({
  enabledFeatures,
  onToggle,
  onSelectAll,
  onClearAll,
}: FeatureTogglesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="small" className="font-semibold text-blue-gray-700">
          功能選擇：
        </Typography>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            onClick={onSelectAll}
            className="capitalize"
          >
            全選
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="gray"
            onClick={onClearAll}
            className="capitalize"
          >
            清除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FEATURES.map((feature) => (
          <Card
            key={feature.id}
            className="p-3 cursor-pointer hover:shadow-lg transition-all duration-200 border border-blue-gray-100"
            onClick={() => onToggle(feature.id)}
          >
            <label
              className="flex items-start gap-2 cursor-pointer"
              title={feature.description}
            >
              <Checkbox
                checked={enabledFeatures.has(feature.id)}
                onChange={() => onToggle(feature.id)}
                color="blue"
                className="hover:before:opacity-0"
                containerProps={{ className: "p-0" }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  {feature.icon && <span className="text-lg">{feature.icon}</span>}
                  <Typography variant="small" className="font-medium text-blue-gray-900">
                    {feature.label}
                  </Typography>
                </div>
                <Typography variant="small" className="text-xs text-blue-gray-600 mt-1">
                  {feature.description}
                </Typography>
              </div>
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}
