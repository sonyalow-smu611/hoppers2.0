"use client";

import { RatingGroup } from "@ark-ui/react/rating-group";
import { StarIcon } from "lucide-react";

export default function RatingGroupStars({ value = 0, onValueChange }) {
  return (
    <RatingGroup.Root
      count={5}
      value={value}
      onValueChange={(details) => onValueChange?.(details.value)}
    >
      <RatingGroup.Control className="inline-flex">
        <RatingGroup.Context>
          {({ items }) =>
            items.map((item) => (
              <RatingGroup.Item
                key={item}
                index={item}
                className="w-8 h-8 p-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <RatingGroup.ItemContext>
                  {({ highlighted }) =>
                    highlighted ? (
                      <StarIcon className="w-6 h-6 text-yellow-400 fill-current" />
                    ) : (
                      <StarIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    )
                  }
                </RatingGroup.ItemContext>
              </RatingGroup.Item>
            ))
          }
        </RatingGroup.Context>
        <RatingGroup.HiddenInput />
      </RatingGroup.Control>
    </RatingGroup.Root>
  );
}
