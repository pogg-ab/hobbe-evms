
CREATE OR REPLACE FUNCTION tr_update_financial_account_balances()
RETURNS TRIGGER AS $$
DECLARE
    FAfinancialAccountId UUID;
    reversesTxnId UUID;
    isNormalDebit BOOLEAN;
    FAtotalBalance NUMERIC(18,2);
    FAcurrencyId VARCHAR(50);
    FTcurrencyId VARCHAR(50);
    ACdelta NUMERIC(18,2);
    ACcurrentBalance NUMERIC(18,2);
    errMsg TEXT;
BEGIN
    -- Loop through each inserted row
    FOR FAfinancialAccountId IN
        SELECT NEW.financial_account_id
    LOOP
        IF FAfinancialAccountId IS NOT NULL THEN
            -- Lock the account row
            SELECT ac. is_normal_debit,
               	fa.total_balance,
               	fa.currency_id
            INTO isNormalDebit, FAtotalBalance, FAcurrencyId
            FROM financial_account fa
            JOIN account_code ac ON fa.account_code_id = ac. account_code_id
            WHERE fa. financial_account_id = FAfinancialAccountId
            FOR UPDATE;
 
            SELECT ft.currency_id,ft.reverses
            INTO FTcurrencyId,reversesTxnId
            FROM transaction ft
            WHERE ft. transaction_id = NEW. transaction_id
            FOR UPDATE;
 
            -- Currency check
            IF COALESCE(FAcurrencyId, '') = COALESCE(FTcurrencyId, '') THEN
            	-- Check reversal validity
            	IF reversesTxnId IS NULL OR NOT EXISTS (
                	SELECT 1
                	FROM transaction
                	WHERE transaction_id = reversesTxnId
                  	AND reversed_by IS NOT NULL
            	) THEN
                	-- Calculate delta
                	ACdelta := CASE
                    	WHEN isNormalDebit THEN NEW.debit_amount - NEW.credit_amount
                    	ELSE NEW. credit_amount - NEW. debit_amount
                	END;
 
                	IF ACdelta <> 0.0 THEN
                    	ACcurrentBalance := FAtotalBalance + ACdelta;
 
                    	IF ACcurrentBalance < 0.0 THEN
                        	errMsg := format(
                            	'Invalid attempt to set negative financial account balance. FA ID: %s, Txn ID: %s, Item ID: %s, Delta: %s, Intended New Amount: %s',
                            	NEW. financial_account_id, NEW.transaction_id, NEW.transaction_item_id, ACdelta, ACcurrentBalance
                        	);
                        	RAISE EXCEPTION '%', errMsg;
                    	END IF;
 
                    	-- Update balance
                    	UPDATE financial_account
                    	SET total_balance = total_balance + ACdelta
                    	WHERE financial_account_id = FAfinancialAccountId;
 
                    	-- Insert change record
                    	INSERT INTO account_change (
                        	created_by, balance, delta,
                        	financial_account_id, transaction_id,
                        	transaction_item_id,updated_by
                    	) VALUES (
                        	NEW. created_by, ACcurrentBalance, ACdelta,
                        	NEW. financial_account_id, NEW.transaction_id,
                        	NEW.transaction_item_id, NEW. created_by
                    	);
                	END IF;
            	ELSE
                	RAISE EXCEPTION 'Trying to reverse already reversed / cancelled transaction.';
            	END IF;
            ELSE
            	RAISE EXCEPTION 'Unmatched currency id';
            END IF;
        ELSE
            -- Missing account id but amounts present
            IF NEW.credit_amount <> 0.0 OR NEW.debit_amount <> 0.0 THEN
            	errMsg := format(
                	'Missing financial account id. Txn ID: %s, Item ID: %s',
                	NEW.transaction_id, NEW.transaction_itemId
            	);
            	RAISE EXCEPTION '%', errMsg;
            END IF;
        END IF;
    END LOOP;
 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_financial_account_balances
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION tr_update_financial_account_balances();

CREATE OR REPLACE FUNCTION fn_insert_financial_account(bankaccountid UUID,currencyid VARCHAR(10),userid UUID,eventid UUID)
RETURNS UUID AS $$
DECLARE
    v_accountcodeid UUID;
    v_financial_account_id UUID;     	
BEGIN
            	SELECT account_code_id INTO v_accountcodeid
            	FROM account_codes
            	WHERE code='2030'
            	LIMIT 1;
            	INSERT INTO financial_accounts (account_code_id,bank_account_id,created_by,created_date,currency_id,financial_account_type_id,total_balance,updated_by,updated_date,user_id,event_id) Values
(v_accountcodeid,bankaccountid,'fixture',CURRENT_DATE,currencyid,'ORGANIZER_VIRTUAL_ACCOUNT',0.00,'fixture',CURRENT_DATE,userid,eventid)
RETURNING financial_account_id INTO v_financial_account_id;           	
RETURN v_financial_account_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_get_pool_account()
RETURNS TABLE(financialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='HOBBE_POOL_ACCOUNT';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_get_revenue_account()
RETURNS TABLE(FinancialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='HOBBE_REVENUE_ACCOUNT';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_get_tax_account()
RETURNS TABLE(FinancialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='TAX_PAYABLE_ACCOUNT';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_get_organizer_account(vUserId UUID,vEventId UUID)
RETURNS TABLE(FinancialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='ORGANIZER_VIRTUAL_ACCOUNT'
            	AND user_Id=vUserId
            	AND event_id=vEventId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_get_gateway_fee_account()
RETURNS TABLE(FinancialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='PAYMENT_GATEWAY_FEE_ACCOUNT';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_get_gateway_expense_account()
RETURNS TABLE(FinancialAccountId UUID,accountcodeid UUID)
AS $$
BEGIN
            	RETURN QUERY
            	SELECT FA.financial_account_id,FA.account_code_id
            	FROM financial_accounts FA
            	WHERE FA. financial_account_type_id ='PAYMENT_GATEWAY_EXPENSE_ACCOUNT';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_cal_commission(vAmount NUMERIC(18,2), vOrganizerid UUID)
RETURNS  NUMERIC(18,2) AS $$
DECLARE
    vRate NUMERIC(18,2);
BEGIN
    IF EXISTS (SELECT 1 FROM commission_fees WHERE organizer_id = vOrganizerid) THEN
        SELECT rate INTO vRate
        FROM commission_fees
        WHERE applies_to_event_type = 'All'
          AND organizer_id = vOrganizerid
        LIMIT 1;
    ELSE
        SELECT rate INTO vRate
        FROM commission_fees
        WHERE applies_to_event_type = 'All'
          AND organizer_id IS NULL
        LIMIT 1;
    END IF;
 
    RETURN vAmount * vRate;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_cal_tax(vAmount NUMERIC(18,2))
RETURNS NUMERIC(18,2) AS $$
DECLARE
    vRate NUMERIC(18,2);
BEGIN
        SELECT rate INTO vRate
        FROM taxes
        LIMIT 1;
    RETURN vAmount * vRate;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_cal_gateway_fee(vAmount NUMERIC(18,2),vProvidername VARCHAR(100))
RETURNS NUMERIC(18,2) AS $$
DECLARE
    vRate NUMERIC(18,2);vFixedfee NUMERIC(18,2);
BEGIN
        SELECT percentage_rate,fixed_fee INTO vRate,vFixedfee
        FROM payment_gateway_fees
                            	WHERE provider_name=vProvidername
        LIMIT 1;
    RETURN vAmount * vRate + vFixedfee;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fn_insert_transaction(vPaymentid UUID,vExternalRefNo VARCHAR(100),vUsername varchar(50),vUserId UUID,v_CurrencyId VARCHAR(10),v_Providername VARCHAR(100))
RETURNS INT AS $$
DECLARE
    v_TransactionId UUID;
            	v_ShortCode VARCHAR(10);
            	v_Amount NUMERIC(18,2);
            	v_Fee NUMERIC(18,2);
            	v_Tax NUMERIC(18,2);
            	v_GatewayFee NUMERIC(18,2);
            	v_Organizerpayout NUMERIC(18,2);
            	v_PoolAccountAmount NUMERIC(18,2);
            	v_transactionitemId UUID;
            	v_Organizerid UUID;
            	v_EventId UUID;
		v_UserId UUID;
            	v_Pool_FinancialAccountId UUID;
            	v_Pool_AccountCodeId UUID;
            	v_Revenue_FinancialAccountId UUID;
            	v_Revenue_AccountCodeId UUID;
            	v_Tax_FinancialAccountId UUID;
            	v_Tax_AccountCodeId UUID;
            	v_Organizer_FinancialAccountId UUID;
            	v_Organizer_AccountCodeId UUID;
            	v_GatewayFee_FinancialAccountId UUID;
            	v_GatewayFee_AccountCodeId UUID;
            	v_GatewayExpense_FinancialAccountId UUID;
            	v_GatewayExpense_AccountCodeId UUID;
            	v_referenceNumber VARCHAR(50);
 
BEGIN
            	SELECT user_id,event_id,amount INTO v_UserId,v_EventId,v_Amount
            	FROM payments WHERE id=vPaymentid LIMIT 1;
            	SELECT user_id INTO v_Organizerid FROM events where id=v_EventId;
            	--calculate Hobbe fee
            	SELECT fn_cal_commission INTO v_Fee FROM fn_cal_commission(v_Amount, v_UserId);
            	
            	SELECT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 5) INTO v_ShortCode;
            	SELECT translate(to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '- :', '') INTO v_referenceNumber;
            	v_referenceNumber := v_referenceNumber || '_' || v_ShortCode;
            	--Adding transaction
            	INSERT INTO transactions (amount,payment_id,created_by,created_date,external_reference_number,fee,transaction_type_id,reference_number,short_code,transaction_date,
updated_by,updated_date,user_id,reversed_by,reverses,currency_id,exchange_rate,__reverses,__reversed_by,foreign_currency_amount) Values
(v_Amount,vPaymentid,vUsername,CURRENT_DATE,vExternalRefNo,v_Fee,'CUSTOMER_TICKET_PURCHASE',v_referenceNumber,v_ShortCode,CURRENT_DATE,vUsername,CURRENT_DATE,vUserId,NULL,NULL,v_CurrencyId,NULL,NULL,NULL,NULL)
            	RETURNING transaction_id INTO v_TransactionId;
--fetching Account detail for journal entries
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Pool_FinancialAccountId,v_Pool_AccountCodeId
            	FROM fn_get_pool_account();
            	
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Revenue_FinancialAccountId,v_Revenue_AccountCodeId
            	FROM fn_get_revenue_account();
            	
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Tax_FinancialAccountId,v_Tax_AccountCodeId
            	FROM fn_get_tax_account();
 
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Organizer_FinancialAccountId,v_Organizer_AccountCodeId
            	FROM fn_get_organizer_account(v_Userid,v_Eventid);
            	
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_GatewayFee_FinancialAccountId,v_GatewayFee_AccountCodeId
            	FROM fn_get_gateway_fee_account();
            	
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_GatewayExpense_FinancialAccountId,v_GatewayExpense_AccountCodeId
            	FROM fn_get_gateway_expense_account();
 
 
--Calculating commission, tax, payment gateway fee and organizer payout amount
 
            	SELECt fn_cal_tax INTO v_Tax FROM fn_cal_tax(v_Amount);
            	SELECT fn_cal_gateway_fee INTO v_GatewayFee FROM fn_cal_gateway_fee(v_Amount,v_Providername);
            	v_Organizerpayout := v_Amount-( v_Fee+ v_Tax + v_GatewayFee);
            	v_PoolAccountAmount := v_Amount-v_GatewayFee;
 
INSERT INTO transaction_items(account_code_id,created_by,Credit_Amount,Debit_Amount,Description,Financial_Account_Id,Transaction_Id,Transaction_Line_Number,Updated_By) Values
(v_Pool_AccountCodeId,'fixture',0.00  ,v_PoolAccountAmount,'The pool account is increased by sales amount - gateway fee',v_Pool_FinancialAccountId,v_TransactionId,1,'fixture'),
(v_Revenue_AccountCodeId,'fixture',v_Fee	,0.00,'Hobbe recognises income on the transaction',v_Revenue_FinancialAccountId,v_TransactionId,2,'fixture'),
(v_Tax_AccountCodeId,'fixture',v_Tax	,0.00,'Hobbe recognises tax on the transaction',v_Tax_FinancialAccountId,v_TransactionId,3,'fixture'),
(v_Organizer_AccountCodeId,'fixture',v_Organizerpayout  ,0.00,'Organizer payout account amount is increased',v_Organizer_FinancialAccountId,v_TransactionId,4,'fixture'),
(v_GatewayFee_AccountCodeId,'fixture',v_GatewayFee	,0.00,'Hobbe record payment gateway fee payable to processor',v_GatewayFee_FinancialAccountId,v_TransactionId,5,'fixture'),
(v_GatewayExpense_AccountCodeId,'fixture',00.00   ,v_GatewayFee,'The payment gateway fee expense receivable is recorded',v_GatewayExpense_FinancialAccountId,v_TransactionId,6,'fixture');
 
 
RETURN v_TransactionId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_auto_refund(vPaymentid UUID,vExternalRefNo VARCHAR(100),vUsername varchar(50),vUserId UUID)
RETURNS TEXT AS $$
DECLARE
    v_TransactionId UUID;
            	v_OriginalTransactionId UUID;
            	v_ShortCode VARCHAR(10);
            	v_Amount NUMERIC(18,2);
            	v_Fee NUMERIC(18,2);
            	v_CurrencyId VARCHAR(10);
            	v_transactionitemId UUID;
            	inserted_count INT := 0;
            	v_referenceNumber VARCHAR(100);
BEGIN
            	SELECT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 5) INTO v_ShortCode;
            	SELECT translate(to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '- :', '') INTO v_referenceNumber;
            	v_referenceNumber := v_referenceNumber || '_' || v_ShortCode;
            	
            	SELECT transaction_id,amount,fee,currency_id INTO v_OriginalTransactionId,v_Amount,v_Fee,v_CurrencyId
            	FROM transactions
            	WHERE payment_Id=vPaymentid
            	AND reversed_by IS NULL
            	AND reverses IS NULL
            	AND __reversed_by IS NULL
            	AND __reverses IS NULL
            	LIMIT 1;
            	INSERT INTO transactions (amount,payment_id,created_by,external_reference_number,fee,transaction_type_id,reference_number,short_code,transaction_date,
            	 updated_by,user_id,reversed_by,reverses,currency_id,exchange_rate,__reverses,__reversed_by,foreign_currency_amount) Values
					(v_Amount,vPaymentid,vUsername,vExternalRefNo,v_Fee,'CUSTOMER_TICKET_PURCHASE_REFUND',v_referenceNumber,v_ShortCode,CURRENT_DATE,vUsername,vUserId,NULL,v_OriginalTransactionId,v_CurrencyId,NULL,NULL,NULL,NULL)
            	RETURNING transaction_id INTO v_TransactionId;
 
   FOR v_transactionitemId IN
        SELECT transaction_item_id
        FROM transaction_items
        WHERE transaction_id = v_OriginalTransactionId
          AND (credit_amount != 5000000000.00 AND debit_amount != 5000000000.00)
          AND (credit_amount > 0 OR debit_amount > 0)
        ORDER BY transaction_line_number ASC
    LOOP
        -- Insert mirrored debit/credit lines
        INSERT INTO transaction_items (
            account_code_id,created_by , credit_amount,debit_amount , description,
            financial_account_id, transaction_id, transaction_line_number, updated_by
        )
        SELECT
            account_code_id,
            'fixture',
            debit_amount,
            credit_amount,
            'reverse - ' || description,
            financial_account_id,
            v_TransactionId,  -- Replace with the new transaction ID variable
            transaction_line_number,
            'fixture'
        FROM transaction_items
        WHERE transaction_item_id = v_transactionitemId;
                            	inserted_count := inserted_count + 1;
    END LOOP;
            	
UPDATE transactions SET reversed_by= v_TransactionId
WHERE transaction_id=v_OriginalTransactionId;
RETURN FORMAT('Refund process completed: %s lines inserted for original transaction ID %s.', inserted_count, v_OriginalTransactionId);
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fn_manual_refund(vPaymentid UUID,vExternalRefNo VARCHAR(100),vUsername varchar(50),vUserId UUID)
RETURNS TEXT AS $$
DECLARE
    v_TransactionId UUID;
            	v_OriginalTransactionId UUID;
            	v_ShortCode VARCHAR(10);
            	v_Amount NUMERIC(18,2);
            	v_Fee NUMERIC(18,2);
            	v_CurrencyId VARCHAR(10);
            	v_transactionitemId UUID;
            	inserted_count INT := 0;
            	v_referenceNumber VARCHAR(100);
BEGIN
            	SELECT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 5) INTO v_ShortCode;
            	SELECT translate(to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '- :', '') INTO v_referenceNumber;
            	v_referenceNumber := v_referenceNumber || '_' || v_ShortCode;
            	
            	SELECT transaction_id,amount,fee,currency_id INTO v_OriginalTransactionId,v_Amount,v_Fee,v_CurrencyId
            	FROM transactions
            	WHERE payment_Id=vPaymentid
            	AND reversed_by IS NULL
            	AND reverses IS NULL
            	AND __reversed_by IS NULL
            	AND __reverses IS NULL
            	LIMIT 1;
            	INSERT INTO transactions (amount,payment_id,created_by,external_reference_number,fee,transaction_type_id,reference_number,short_code,transaction_date,
            	 updated_by,user_id,reversed_by,reverses,currency_id,exchange_rate,__reverses,__reversed_by,foreign_currency_amount) Values
					(v_Amount,vPaymentid,vUsername,vExternalRefNo,v_Fee,'CUSTOMER_TICKET_PURCHASE_REFUND',v_referenceNumber,v_ShortCode,CURRENT_DATE,vUsername,vUserId,NULL,NULL,v_CurrencyId,NULL,v_OriginalTransactionId,NULL,NULL)
            	RETURNING transaction_id INTO v_TransactionId;
 
   FOR v_transactionitemId IN
        SELECT transaction_item_id
        FROM transaction_items
        WHERE transaction_id = v_OriginalTransactionId
          AND (credit_amount != 5000000000.00 AND debit_amount != 5000000000.00)
          AND (credit_amount > 0 OR debit_amount > 0)
        ORDER BY transaction_line_number ASC
    LOOP
        -- Insert mirrored debit/credit lines
        INSERT INTO transaction_items (
            account_code_id,created_by , credit_amount,debit_amount , description,
            financial_account_id, transaction_id, transaction_line_number, updated_by
        )
        SELECT
            account_code_id,
            'fixture',
            debit_amount,
            credit_amount,
            'reverse - ' || description,
            financial_account_id,
            v_TransactionId,  -- Replace with the new transaction ID variable
            transaction_line_number,
            'fixture'
        FROM transaction_items
        WHERE transaction_item_id = v_transactionitemId;
                            	inserted_count := inserted_count + 1;
    END LOOP;
            	
UPDATE transactions SET __reversed_by= v_TransactionId
WHERE transaction_id=v_OriginalTransactionId;
RETURN FORMAT('Refund process completed: %s lines inserted for original transaction ID %s.', inserted_count, v_OriginalTransactionId);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_insert_payout_transaction(vExternalRefNo VARCHAR(100),vUsername varchar(50),vEventId UUID,vUserId UUID,v_CurrencyId VARCHAR(10))
RETURNS INT AS $$
DECLARE
    			v_TransactionId UUID;
            	v_ShortCode VARCHAR(10);
            	v_Amount NUMERIC(18,2);
            	v_transactionitemId UUID;
            	v_Organizer_FinancialAccountId UUID;
            	v_Organizer_AccountCodeId UUID;
				v_Pool_FinancialAccountId UUID;
				v_Pool_AccountCodeId UUID;
            	v_referenceNumber VARCHAR(50);
 
BEGIN
 
            	SELECT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 5) INTO v_ShortCode;
            	SELECT translate(to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '- :', '') INTO v_referenceNumber;
            	v_referenceNumber := v_referenceNumber || '_' || v_ShortCode;
            	SELECT total_balance INTO v_Amount FROM financial_account WHERE financial_account_type_id='ORGANIZER_VIRTUAL_ACCOUNT' AND event_id=vEventId AND user_id=vUserId LIMIT 1;
            	--Adding transaction
            	INSERT INTO transactions (amount,external_reference_number,created_by,fee,transaction_type_id,reference_number,short_code,transaction_date,
            	 updated_by,user_id,reversed_by,reverses,currency_id,exchange_rate,__reverses,__reversed_by,foreign_currency_amount) Values
				(v_Amount,vExternalRefNo,vUsername,0.00,'ORGANIZER_PAYOUT',v_referenceNumber,v_ShortCode,CURRENT_DATE,vUsername,vUserId,NULL,NULL,v_CurrencyId,NULL,NULL,NULL,NULL)
            	RETURNING transaction_id INTO v_TransactionId;
--fetching Account detail for journal entries
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Pool_FinancialAccountId,v_Pool_AccountCodeId
            	FROM fn_get_pool_account();
            	
            	SELECT FinancialAccountId,accountcodeid
                            	INTO v_Organizer_FinancialAccountId,v_Organizer_AccountCodeId
            	FROM fn_get_organizer_account(vUserId,vEventId);
            	
INSERT INTO transaction_Items(account_code_id,Created_By,Credit_Amount,Debit_Amount,Description,Financial_Account_Id,Transaction_Id,Transaction_Line_Number,Updated_By) Values
(v_Pool_AccountCodeId,'fixture',v_Amount  ,0.00,'The pool account is decreased by payout amount',v_Pool_FinancialAccountId,v_TransactionId,1,'fixture'),
(v_Organizer_AccountCodeId,'fixture',0.00	,v_Amount,'Organizer payout account is decreased',v_Organizer_FinancialAccountId,v_TransactionId,2,'fixture');
 RETURN  v_TransactionId;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fn_get_organizer_balance(vUserId UUID,vEventId UUID)
RETURNS NUMERIC(18,2) AS $$
DECLARE
            	v_Balance NUMERIC(18,2);
 
BEGIN
    SELECT total_balance INTO v_Balance FROM financial_account WHERE financial_account_type_id='ORGANIZER_VIRTUAL_ACCOUNT' AND event_id=vEventId AND user_id=vUserId LIMIT 1;
	RETURN  v_Balance;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION fn_report_live_revenue_dashboard(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    report_date DATE,
    event_name VARCHAR,
    organizer_name VARCHAR,
    payment_method VARCHAR,
    currency_code VARCHAR,
    total_revenue NUMERIC(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(ft.transaction_date) AS report_date,
        e.title event_name,
        COALESCE(oa.company_name,first_name || ' ' || surname) organizer_name,
        pm.payment_method AS payment_method,
        ft.currency_id currency_code,
        SUM(ft.amount) AS total_revenue
    FROM transactions ft
	INNER JOIN "user" u ON u.user_id = ft.user_id
	LEFT JOIN organizational_account oa ON oa.organizational_account_id=u.organizational_account_id
	LEFT JOIN personal_account pa ON pa.personal_account_id=u.personal_account_id
    INNER JOIN events e ON e.user_id = u.user_id
    INNER JOIN payments pm ON pm.id = ft.payment_id
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
      AND ft._reversed_by is null and _reverses is null and reversed_by is null and reverses is null
    GROUP BY
        DATE(ft.transaction_date),
        e.title,
        COALESCE(oa.company_name,first_name || ' ' || surname),
        pm.payment_method,
        ft.currency_id
    ORDER BY report_date, event_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_report_revenue_history(
    p_start_date DATE,
    p_end_date DATE,
    p_group_by TEXT DEFAULT 'DAILY'  -- Options: 'DAILY' or 'MONTHLY'
)
RETURNS TABLE (
    report_period TEXT,
    event_name VARCHAR,
    organizer_name VARCHAR,
    payment_method VARCHAR,
    currency_code VARCHAR,
    total_revenue NUMERIC(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE 
            WHEN UPPER(p_group_by) = 'MONTHLY' THEN TO_CHAR(ft.transaction_date, 'YYYY-MM')
            ELSE TO_CHAR(ft.transaction_date, 'YYYY-MM-DD')
        END AS report_period,
        e.title event_name,
        o.COALESCE(oa.company_name,first_name || ' ' || surname) organizer_name,
        pm.payment_method AS payment_method,
        ft.currency_id currency_code,
        SUM(ft.amount) AS total_revenue
	FROM transactions ft
	INNER JOIN "user" u ON u.user_id = ft.user_id
	LEFT JOIN organizational_account oa ON oa.organizational_account_id=u.organizational_account_id
	LEFT JOIN personal_account pa ON pa.personal_account_id=u.personal_account_id
    INNER JOIN events e ON e.user_id = CAST(u.user_id as varchar)
    INNER JOIN payments pm ON pm.id = ft.payment_id
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
      AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null
    GROUP BY
        report_period,
        e.title,
        COALESCE(oa.company_name,first_name || ' ' || surname),
        pm.payment_method,
        ft.currency_id
    ORDER BY report_period, event_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_report_refund_history(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    report_date DATE,
    event_name VARCHAR,
    organizer_name VARCHAR,
    refund_count BIGINT,
    total_refund NUMERIC(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(ft.transaction_date) AS report_date,
        e.title event_name,
        COALESCE(oa.company_name,first_name || ' ' || surname) organizer_name,
        COUNT(ft.transaction_id) AS refund_count,
        SUM(ft.amount) AS total_refund
    FROM transactions ft
	INNER JOIN "user" u ON u.user_id = ft.user_id
	LEFT JOIN organizational_account oa ON oa.organizational_account_id=u.organizational_account_id
	LEFT JOIN personal_account pa ON pa.personal_account_id=u.personal_account_id
    INNER JOIN events e ON e.user_id = CAST(u.user_id as varchar)
     WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id IN ('CUSTOMER_TICKET_PURCHASE_REFUND','CUSTOMER_TICKET_MANUAL_REFUND')
      
    GROUP BY DATE(ft.transaction_date), e.title, COALESCE(oa.company_name,first_name || ' ' || surname)
    ORDER BY report_date;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_report_payment_method_usage(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    payment_method VARCHAR,
    transaction_count BIGINT,
    total_amount NUMERIC(18,2),
    currency_code VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pm.payment_method,
        COUNT(ft.transaction_id) AS transaction_count,
        SUM(ft.amount) AS total_amount,
        ft.currency_id currency_code
    FROM transactions ft
    INNER JOIN payments pm ON pm.id = ft.payment_id
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
      AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
      AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null
    GROUP BY pm.payment_method,
        ft.currency_id
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_financial_fees_payout_report(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    transaction_date DATE,
    event_name VARCHAR,
    organizer_name VARCHAR,
    payment_method VARCHAR,
    currency VARCHAR,
    total_amount NUMERIC,
    gateway_fee NUMERIC,
    commission_fee NUMERIC,
    payout_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH cte_transactions AS (
        SELECT
            transaction_id,
			DATE(ft.transaction_date) AS transaction_date,
			e.user_id,
			e.id event_id,
        	e.title event_name,
        	COALESCE(oa.company_name,first_name || ' ' || surname) organizer_name,
        	pm.payment_method AS payment_method,
        	ft.currency_id currency_code,
            ft.amount
        FROM transactions ft
	INNER JOIN "user" u ON u.user_id = ft.user_id
	LEFT JOIN organizational_account oa ON oa.organizational_account_id=u.organizational_account_id
	LEFT JOIN personal_account pa ON pa.personal_account_id=u.personal_account_id
    INNER JOIN events e ON e.user_id = CAST(u.user_id as varchar)
    INNER JOIN payments pm ON pm.id = ft.payment_id
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
      AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null
    ),
	cte_transaction_item AS (
	SELECT fti.transaction_id,fti.credit_amount,fti.debit_amount,financial_account_type_id,total_balance
	FROM cte_transactions ft
	JOIN transaction_items fti ON ft.transaction_id=fti.transaction_id
	join financial_accounts fa ON fa.financial_account_id=fti.financial_account_id
	WHERE financial_account_type_id IN ('PAYMENT_GATEWAY_FEE_ACCOUNT','HOBBE_REVENUE_ACCOUNT','ORGANIZER_VIRTUAL_ACCOUNT')
	)
	SELECT
        tf.transaction_date,
        tf.event_name,
        tf.organizer_name,
        tf.payment_method,
        tf.currency_code,
        tf.amount,
        fti3.credit_amount-fti3.debit_amount gateway_fee,
        fti2.credit_amount-fti2.debit_amount commission_fee,
        fti1.credit_amount-fti1.debit_amount payout_amount
    FROM cte_transactions tf 
	LEFT JOIN cte_transaction_item fti1 ON tf.transaction_id=fti1.transaction_id AND fti1.financial_account_type_id='ORGANIZER_VIRTUAL_ACCOUNT' 
    LEFT JOIN cte_transaction_item fti2 ON tf.transaction_id=fti2.transaction_id AND fti2.financial_account_type_id='HOBBE_REVENUE_ACCOUNT'
    LEFT JOIN cte_transaction_item fti3 ON tf.transaction_id=fti3.transaction_id AND fti3.financial_account_type_id='PAYMENT_GATEWAY_FEE_ACCOUNT'
    WHERE fti1.total_balance=0
    ORDER BY tf.transaction_date,tf.event_id, tf.user_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_net_revenue_report(
    p_start_date DATE,
    p_end_date DATE,
    p_group_by TEXT DEFAULT 'day'  -- Options: 'day', 'month'
)
RETURNS TABLE(
    period DATE,
    total_gross NUMERIC,
    total_fees NUMERIC,
    total_refunds NUMERIC,
    net_revenue NUMERIC,
    currency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH base_tx AS (
        SELECT
			ft.transaction_id,
			ft.transaction_date::DATE AS tx_date,
            ft.currency_id currency,
            ft.amount AS gross_amount,
            0::NUMERIC AS total_fees,
            0::NUMERIC AS refunds
        FROM transactions ft
		
	    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
	),
	fees_tx AS (
	SELECT fti.transaction_id,
			ft.tx_date,
			ft.currency,
			0::NUMERIC AS gross_amount,
			SUM(fti.credit_amount-fti.debit_amount) total_fees,
		    0::NUMERIC AS refunds
	FROM base_tx ft
	JOIN transaction_items fti ON ft.transaction_id=fti.transaction_id
	join financial_accounts fa ON fa.financial_account_id=fti.financial_account_id
	WHERE financial_account_type_id IN ('PAYMENT_GATEWAY_FEE_ACCOUNT','ORGANIZER_VIRTUAL_ACCOUNT')
	GROUP BY fti.transaction_id,tx_date,ft.currency
    ),
    refunds_tx AS (
        SELECT
            ft.transaction_id,
			ft.transaction_date::DATE AS tx_date,
            ft.currency_id currency,
            0::NUMERIC AS gross_amount,
            0::NUMERIC AS total_fees,
            ft.amount AS refunds
        FROM transactions ft
	    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND ft.transaction_type_id IN ('CUSTOMER_TICKET_PURCHASE_REFUND','CUSTOMER_TICKET_MANUAL_REFUND')
    ), 
    combined AS (
        SELECT * FROM base_tx
		UNION ALL
		SELECT * FROM fees_tx
        UNION ALL
        SELECT * FROM refunds_tx
    )
    SELECT
        CASE
            WHEN p_group_by = 'month' THEN DATE_TRUNC('month', tx_date)::DATE
            ELSE tx_date
        END AS period,
        SUM(c.gross_amount) AS total_gross,
        SUM(c.total_fees) AS total_fees,
        SUM(c.refunds) AS total_refunds,
        SUM(c.gross_amount - c.total_fees - c.refunds) AS net_revenue,
        c.currency
    FROM combined c
    GROUP BY period, c.currency
    ORDER BY period;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_dashboard_analytics(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    metric TEXT,
    value NUMERIC
) AS $$
DECLARE
    v_gross NUMERIC;
    v_total_fees NUMERIC;
    v_net NUMERIC;
    v_arpu NUMERIC;
    v_payouts NUMERIC;
    v_unique_users BIGINT;
BEGIN
    -- Gross revenue
	 SELECT COALESCE(SUM(amount), 0)
    	INTO v_gross
     FROM transactions ft
	    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
	  AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null;
     -- Total fees (gateway + commission)
    SELECT COALESCE(SUM(fti.credit_amount-fti.debit_amount), 0)
    INTO v_total_fees
    FROM transactions ft
	JOIN transaction_items fti ON ft.transaction_id=fti.transaction_id
	join financial_accounts fa ON fa.financial_account_id=fti.financial_account_id
	 WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='CUSTOMER_TICKET_PURCHASE'
	  AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null
	  AND financial_account_type_id IN ('PAYMENT_GATEWAY_FEE_ACCOUNT','ORGANIZER_VIRTUAL_ACCOUNT');
	
    -- Net revenue
    v_net := v_gross - v_total_fees;

    -- Unique users
    SELECT COUNT(DISTINCT user_id)
    INTO v_unique_users
    FROM transactions ft
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	AND ft.__reversed_by is null and __reverses is null and reversed_by is null and reverses is null;

    -- ARPU
    IF v_unique_users > 0 THEN
        v_arpu := v_gross / v_unique_users;
    ELSE
        v_arpu := 0;
    END IF;

    -- Organizer payouts
    SELECT COALESCE(SUM(amount), 0)
    INTO v_payouts
    FROM transactions ft
    WHERE ft.transaction_date::DATE BETWEEN p_start_date AND p_end_date
	  AND transaction_type_id='ORGANIZER_PAYOUT';
    -- Return rows as metric-value pairs
    RETURN QUERY
    SELECT 'Gross Revenue'::TEXT, v_gross
    UNION ALL
    SELECT 'Total Fees Collected', v_total_fees
    UNION ALL
    SELECT 'Net Revenue', v_net
    UNION ALL
    SELECT 'Average Revenue Per User (ARPU)', v_arpu
    UNION ALL
    SELECT 'Organizer Payouts', v_payouts;
END;
$$ LANGUAGE plpgsql;



















