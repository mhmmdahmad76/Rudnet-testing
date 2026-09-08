-- The bank-transfer payment request now carries the actual proof-of-payment
-- file a student uploaded (stored in Netlify Blobs; this column just points
-- at it) so an admin can open and review it before approving or rejecting.

ALTER TABLE payment_requests
  ADD COLUMN receipt_key TEXT,
  ADD COLUMN receipt_filename TEXT;

-- Card payments were removed — bank transfer (with a real uploaded receipt)
-- is now the only way to pay, so 'card' is no longer a valid method.
ALTER TABLE payment_requests DROP CONSTRAINT payment_requests_method_check;
ALTER TABLE payment_requests ADD CONSTRAINT payment_requests_method_check
  CHECK (method IN ('transfer'));
