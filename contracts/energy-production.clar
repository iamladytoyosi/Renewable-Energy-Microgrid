;; Energy Production Contract

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))

(define-map producers
  { producer-id: principal }
  { energy-type: (string-ascii 20), capacity: uint }
)

(define-map energy-production
  { producer-id: principal, timestamp: uint }
  { amount: uint }
)

(define-public (register-producer (energy-type (string-ascii 20)) (capacity uint))
  (ok (map-set producers
    { producer-id: tx-sender }
    { energy-type: energy-type, capacity: capacity }
  ))
)

(define-public (record-production (amount uint))
  (let
    ((producer (unwrap! (map-get? producers { producer-id: tx-sender }) (err ERR_NOT_FOUND))))
    (ok (map-set energy-production
      { producer-id: tx-sender, timestamp: block-height }
      { amount: amount }
    ))
  )
)

(define-read-only (get-producer-info (producer-id principal))
  (map-get? producers { producer-id: producer-id })
)

(define-read-only (get-production (producer-id principal) (timestamp uint))
  (map-get? energy-production { producer-id: producer-id, timestamp: timestamp })
)

