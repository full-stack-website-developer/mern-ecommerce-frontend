import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const OptionGroupSelector = ({
  optionGroups = [],
  value = [],
  onChange,
  error = null,
  className = '',
  loading = false,
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  // Expand all groups on first load
  useEffect(() => {
    const initialExpanded = {};
    optionGroups.forEach(group => {
      initialExpanded[group._id] = true;
    });
    setExpandedGroups(initialExpanded);
  }, [optionGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleValue = (group, valueItem) => {
    // Always work with string IDs for comparisons — never compare object references
    const groupId   = group._id.toString();
    const valueId   = valueItem._id.toString();

    // Clone deeply enough that we don't mutate existing state
    let updated = value.map(opt => ({
      optionId: opt.optionId,
      values:   [...opt.values],
    }));

    const groupIndex = updated.findIndex(
      opt => opt.optionId._id.toString() === groupId
    );

    if (groupIndex > -1) {
      // Group exists — toggle the value inside it
      const valueIndex = updated[groupIndex].values.findIndex(
        v => v._id.toString() === valueId
      );

      if (valueIndex > -1) {
        // Value is selected — remove it
        updated[groupIndex].values.splice(valueIndex, 1);
        // If no values left for this group, remove the group entry too
        if (updated[groupIndex].values.length === 0) {
          updated.splice(groupIndex, 1);
        }
      } else {
        // Value not selected — add the full value object
        updated[groupIndex].values.push(valueItem);
      }
    } else {
      // Group not present yet — add it with this value
      updated.push({
        optionId: group,      // full object — useProductForm reads .optionId._id
        values:   [valueItem], // full object — useProductForm reads ._id, .label
      });
    }

    onChange?.(updated);
  };

  // Check if a specific value is selected using string ID comparison
  const isValueSelected = (groupId, valueId) => {
    const group = value.find(
      opt => opt.optionId._id?.toString() === groupId.toString()
    );
    return group?.values.some(v => v._id?.toString() === valueId.toString()) ?? false;
  };

  if (loading) return <Spinner />;

  return (
    <div className={`space-y-4 ${className}`}>
      {optionGroups.map(group => {
        const isExpanded = expandedGroups[group._id];
        return (
          <div key={group._id} className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleGroup(group._id)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <span className="font-medium">{group.name}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.values.map(valueItem => {
                  const selected = isValueSelected(group._id, valueItem._id);
                  return (
                    <button
                      key={valueItem._id}
                      type="button"
                      onClick={() => handleToggleValue(group, valueItem)}
                      className={`px-3 py-2 rounded-lg border-2 flex items-center gap-2 ${
                        selected
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {group.displayType === 'color-swatch' && valueItem.metadata?.hex && (
                        <div
                          className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: valueItem.metadata.hex }}
                        />
                      )}

                      <span className="text-sm">{valueItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default OptionGroupSelector;