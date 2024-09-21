import Transaction from "@/lib/data/Transaction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../pagination";
import { RadixNetwork } from "@radixdlt/radix-dapp-toolkit";
import Toastify from "toastify-js";

interface TransactionListProps {
    networkId: number,
    transactions: Array<Transaction>
}

const MAX_TX_PER_PAGE = 5;

export default function TransactionList({ transactions, networkId }: TransactionListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const NUMBER_OF_PAGES = Math.ceil(transactions.length / MAX_TX_PER_PAGE)
    const RADIX_DASHBOARD_TRANSACTION_URL = networkId == RadixNetwork.Stokenet ? "https://stokenet-dashboard.radixdlt.com/transaction" : "https://dashboard.radixdlt.com/transaction"

    if (transactions.length == 0) {
        return <p className="p-2">No transaction to show.</p>
    }

    function hasPrev() {
        return currentPage > 1;
    }

    function hasNext() {
        return currentPage < NUMBER_OF_PAGES;
    }

    function paginate(current: number, max: number): string[] {
        const items = ["1"];

        if (current === 1 && max === 1) return items
        if (current > 4) items.push('ELIPSIS')

        const r = 2, r1 = current - r, r2 = current + r

        for (let i = r1 > 2 ? r1 : 2; i <= Math.min(max, r2); i++) items.push(i.toString())

        if (r2 + 1 < max) items.push('ELIPSIS')
        if (r2 < max) items.push(max.toString())

        return items
    }

    function shortenTxHash(hash: string): string {
        return hash.slice(0, 10) + "..." + hash.slice(-10)
    }

    function transactionUrl(txHash: string): string{
        return `${RADIX_DASHBOARD_TRANSACTION_URL}/${txHash}/summary`
    }

    function handleCopyManifest(manifest: string) {
        navigator.clipboard.writeText(manifest);

        Toastify({
            text: "Copied Manifest to clipboard",
            className: "success",
            gravity: "bottom",
            position: "right"
        }).showToast()
    }

    const rows = transactions.slice((currentPage - 1) * MAX_TX_PER_PAGE, (currentPage - 1) * MAX_TX_PER_PAGE + MAX_TX_PER_PAGE).map((tx) => {
        return <TableRow key={tx.hash}>
            <TableCell>
                <div className="flex">
                    <p className="flex-grow overflow-ellipsis overflow-hidden text-nowrap">{shortenTxHash(tx.hash)}</p>
                </div>

            </TableCell>
            <TableCell>
                <div className="flex text-lg">
                    <div className="mr-2"> {/* Open in explorer */}
                        <a href={transactionUrl(tx.hash)} target="_blank" title="Copy manifest to clipboard"><i className="bi bi-box-arrow-up-right"></i></a>
                    </div>

                    <div onClick={() => handleCopyManifest(tx.manifest)} className="cursor-pointer"> {/* Create new tab from this manifest  */}
                        <i className="bi bi-copy" title="Copy manifest to clipboard"></i>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    })

    const paginationItems = paginate(currentPage, NUMBER_OF_PAGES).map(page => {
        if (page == "ELIPSIS") {
            return <PaginationItem key={page}>
                <PaginationEllipsis />
            </PaginationItem>
        }

        const pageNumber = parseInt(page);

        return <PaginationItem key={page}>
            <PaginationLink onClick={() => setCurrentPage(pageNumber)} href="#/" isActive={pageNumber == currentPage}>{pageNumber}</PaginationLink>
        </PaginationItem>
    })

    return <div>
        <div className="max-h-[350px] overflow-y-scroll mb-2">
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead>Hash</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows}
                </TableBody>
            </Table>
        </div>

        <Pagination className="mb-2">
            <PaginationContent>
                {hasPrev() && <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} href="#/" />
                </PaginationItem>}
                {paginationItems}
                {hasNext() && <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} href="#/" />
                </PaginationItem>}
            </PaginationContent>
        </Pagination>
    </div>

}