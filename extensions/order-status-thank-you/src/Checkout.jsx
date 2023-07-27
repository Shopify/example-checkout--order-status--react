import {
  reactExtension,
  BlockStack,
  View,
  Heading,
  Text,
  ChoiceList,
  Choice,
  Button,
  useStorage,
} from '@shopify/ui-extensions-react/checkout';
import {useCallback, useEffect, useState} from 'react';
// [START order-status.extension-point]
// Allow the attribution survey to display on the thank you page.
const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => <Attribution />);
export { thankYouBlock };

const orderDetailsBlock = reactExtension("customer-account.order-status.block.render", () => <ProductReview />);
export { orderDetailsBlock };
// [END order-status.extension-point]
// [START order-status.attribution-survey]
function Attribution() {
  const [attribution, setAttribution] = useState('');
  const [loading, setLoading] = useState(false);
  // Store into local storage if the attribution survey was completed by the customer.
  const [attributionSubmitted, setAttributionSubmitted] = useStorageState('attribution-submitted')

  async function handleSubmit() {
    // Simulate a server request
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
      // Send the review to the server
      console.log('Submitted:', attribution);
      setLoading(false);
      setAttributionSubmitted(true)
      resolve();
    }, 750)});
  }

  // Hides the survey if the attribution has already been submitted
  if (attributionSubmitted.loading || attributionSubmitted.data === true) {
    return null;
  }

  return (
    <Survey title="How did you hear about us ?" onSubmit={handleSubmit} loading={loading}>
      <ChoiceList
        name="sale-attribution"
        value={attribution}
        onChange={setAttribution}
      >
        <BlockStack>
          <Choice id="tv">TV</Choice>
          <Choice id="podcast">Podcast</Choice>
          <Choice id="family">From a friend or family member</Choice>
          <Choice id="tiktok">Tiktok</Choice>
        </BlockStack>
      </ChoiceList>
    </Survey>
  );
}
// [END order-status.attribution-survey]

// [START order-status.product-review]
function ProductReview() {
  const [productReview, setProductReview] = useState('');
  const [loading, setLoading] = useState(false);
  // Store into local storage if the product was reviewed by the customer.
  const [productReviewed, setProductReviewed] = useStorageState('product-reviewed')

  async function handleSubmit() {
    // Simulate a server request
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
      // Send the review to the server
      console.log('Submitted:', productReview);
      setLoading(false);
      setProductReviewed(true);
      resolve();
    }, 750)});
  }

  // Hides the survey if the product has already been reviewed
  if (productReviewed.loading || productReviewed.data) {
    return null;
  }

  return (
    <Survey
      title="How do you like your purchase?"
      description="We would like to learn if you are enjoying your purchase."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ChoiceList
        name="product-review"
        value={productReview}
        onChange={setProductReview}
      >
        <BlockStack>
          <Choice id="5">Amazing! Very happy with it.</Choice>
          <Choice id="4">It's okay, I expected more.</Choice>
          <Choice id="3">Eh. There are better options out there.</Choice>
          <Choice id="2">I regret the purchase.</Choice>
        </BlockStack>
      </ChoiceList>
    </Survey>
  );
}
// [END order-status.product-review]

// [START order-status.survey-component]
function Survey({
  title,
  description,
  onSubmit,
  children,
  loading,
}) {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    await onSubmit();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          <Heading>Thanks for your feedback!</Heading>
          <Text>Your response has been submitted</Text>
        </BlockStack>
      </View>
    );
  }

  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack>
        <Heading>{title}</Heading>
        <Text>{description}</Text>
        {children}
        <Button kind="secondary" onPress={handleSubmit} loading={loading}>
          Submit feedback
        </Button>
      </BlockStack>
    </View>
  );
}
// [END order-status.survey-component]

/**
 * Returns a piece of state that is persisted in local storage, and a function to update it.
 * The state returned contains a `data` property with the value, and a `loading` property that is true while the value is being fetched from storage.
 */
function useStorageState(key) {
  const storage = useStorage();
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function queryStorage() {
      const value = await storage.read(key)
      setData(value);
      setLoading(false)
    }

    queryStorage();
  }, [setData, setLoading, storage, key])

  const setStorage = useCallback((value) => {
    storage.write(key, value)
  }, [storage, key])

  return [{data, loading}, setStorage]
}
